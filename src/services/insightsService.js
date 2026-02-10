const insightsModel = require("../models/insightsModel");
const interpreters = require("../utils/interpreters");
const correlationConfidence = require("../utils/confidence/correlationConfidence");
const { buildClinicalSentence } = require("../utils/clinicalSentence");
const { buildClinicalSummaryCard } = require("../utils/clinicalSummaryCard");
const { interpretBpDiurnal } = require("../utils/interpreters/bloodPressureDiurnal");
const { computeBpTrend } = require("./bpTrendService");
const { interpretBpTrend } = require("../utils/interpreters/bloodPressureTrend");


async function buildBpVariabilityInsight({ userId, from, to }) {
  const stats = await insightsModel.getBpVariability({ userId, from, to });

  if (!stats || !stats.std_dev) return null;

  const sd = Number(stats.std_dev);

  let level = "low";
  if (sd >= 15) level = "high";
  else if (sd >= 10) level = "moderate";

  return {
    type: "bp_variability",
    stdDev: sd,
    mean: stats.mean_bp,
    level,
    message: `BP variability is ${level} (SD ${sd} mmHg).`
  };
}


async function buildBpControlInsight({ userId, from, to }) {
  const stats = await insightsModel.getBpControlStats({ userId, from, to });

  if (!stats || !stats.total_days) return null;

  const total = Number(stats.total_days);
  const uncontrolled = Number(stats.uncontrolled_days);

  if (!total) return null;

  const percent = Math.round((uncontrolled / total) * 100);

  let status = "well controlled";
  if (percent > 50) status = "uncontrolled";
  else if (percent > 25) status = "partially controlled";

  return {
    type: "bp_control",
    percent,
    uncontrolledDays: uncontrolled,
    totalDays: total,
    message: `${percent}% of days above 140 mmHg — BP ${status}.`
  };
}




async function getInsightCards(userId, startDate, endDate) {
  const insights = [];

  const from = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = endDate || new Date();

  const correlations = [
    { symptom: "fatigue", metric: "heart_rate", minSeverity: 3 },
    { symptom: "shortness_of_breath", metric: "heart_rate", minSeverity: 3 },
    { symptom: "chest_pain", metric: "heart_rate", minSeverity: 3 },

    { symptom: "chest_pain", metric: "blood_pressure_systolic", minSeverity: 3 },
    { symptom: "chest_pain", metric: "blood_pressure_diastolic", minSeverity: 3 },
    { symptom: "occipital_head_pain", metric: "blood_pressure_systolic", minSeverity: 3 },
    { symptom: "occipital_head_pain", metric: "blood_pressure_diastolic", minSeverity: 3 }
  ];
  
  const symptomRange = await insightsModel.getSymptomDateRange(userId);

  // Fallback if no symptoms exist
  const corrFrom = symptomRange?.from ?? from;
  const corrTo   = symptomRange?.to   ?? to;

  for (const c of correlations) {
    const symptomStats =
      await insightsModel.getDailyMetricStatsForSymptomDays(
        userId,
        c.symptom,
        c.metric,
        c.minSeverity,
        corrFrom,
        corrTo
      );

    const baselineStats =
      await insightsModel.getDailyMetricStatsForBaselineDays(
        userId,
        c.metric,
        corrFrom,
        corrTo
      );
	
	if (
	  !symptomStats ||
	  !baselineStats ||
	  symptomStats.count < 2 ||
	  baselineStats.count < 4 ||
	  symptomStats.avg == null ||
	  baselineStats.avg == null
	) {
	  continue;
	}

    const symptomAvg = Math.round(symptomStats.avg);
    const baselineAvg = Math.round(baselineStats.avg);

    const interpreter = interpreters[c.metric];
    if (!interpreter) continue;

    const insight = interpreter(symptomStats, baselineStats);
    if (!insight) continue;
	
	const confidence = correlationConfidence.calculateConfidence(symptomStats.count) ?? "low";

    insights.push({
	  type: "correlation",
      ...insight,
      symptom: c.symptom,
      metricType: c.metric,
	  metricLabel: insight.metric,
      symptomAvg,
      baselineAvg,
      delta: symptomAvg - baselineAvg,
      confidence,
      sampleSize: symptomStats.count,
      clinicalSentence: buildClinicalSentence({
        symptom: c.symptom,
        metric: c.metric,
        symptomAvg,
        baselineAvg,
        count: symptomStats.count
      })
    });
  }
  
  // BP Trend Insight (clinically conservative)
  const systolicTrend = await computeBpTrend({
	  userId,
	  metric: "blood_pressure_systolic",
	  windowDays: 14
  });

  if (systolicTrend && systolicTrend.confidence !== "low") {
	  const trendInsight = interpretBpTrend(systolicTrend);
	  if (trendInsight) insights.push(trendInsight);
  }


  // Diurnal BP from daily_metric_series
  const BP_DIURNAL_METRIC = "blood_pressure_systolic";

  if (BP_DIURNAL_METRIC === "blood_pressure_systolic") {
	  const morningBp = await insightsModel.getBpDiurnalStats({
		userId,
		metric: BP_DIURNAL_METRIC,
		timeOfDay: "morning",
		from,
		to
    });

	  const eveningBp = await insightsModel.getBpDiurnalStats({
		userId,
		metric: BP_DIURNAL_METRIC,
		timeOfDay: "evening",
		from,
		to
	  });

	  const diurnalInsight = interpretBpDiurnal(morningBp, eveningBp);
	  if (diurnalInsight) insights.push(diurnalInsight);
  }
  
  const variabilityInsight = await buildBpVariabilityInsight({ userId, from, to });
  if (variabilityInsight) insights.push(variabilityInsight);
  
  const controlInsight = await buildBpControlInsight({ userId, from, to });
  if (controlInsight) insights.push(controlInsight);


  // Extract dynamic BP stats from generated insights
  const bpTrend = insights.find(i => i.type === "bp_trend");
  const bpVariability = insights.find(i => i.type === "bp_variability");
  const bpControl = insights.find(i => i.type === "bp_control");

  return {
	  insights,
	  summaryStats: {
		mean: bpTrend?.mean ?? bpVariability?.mean ?? null,
		stdDev: bpVariability?.stdDev ?? null,
		percentUncontrolled: bpControl?.percent ?? null
	  }
  };

}

module.exports = { getInsightCards };
