const insightsModel = require("../models/insightsModel");
const interpreters = require("../utils/interpreters");
const correlationConfidence = require("../utils/confidence/correlationConfidence");
const { buildClinicalSentence } = require("../utils/clinicalSentence");
const { buildClinicalSummaryCard } = require("../utils/clinicalSummaryCard");
const { interpretBpDiurnal } = require("../utils/interpreters/bloodPressureDiurnal");

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

  for (const c of correlations) {
    const symptomStats =
      await insightsModel.getDailyMetricStatsForSymptomDays(
        userId,
        c.symptom,
        c.metric,
        c.minSeverity,
        from,
        to
      );

    const baselineStats =
      await insightsModel.getDailyMetricStatsForBaselineDays(
        userId,
        c.metric,
        from,
        to
      );

    if (
      !symptomStats ||
      !baselineStats ||
      symptomStats.count < 3 ||
      baselineStats.count < 3
    ) continue;

    const symptomAvg = Math.round(symptomStats.avg);
    const baselineAvg = Math.round(baselineStats.avg);

    const interpreter = interpreters[c.metric];
    if (!interpreter) continue;

    const insight = interpreter(symptomStats, baselineStats);
    if (!insight) continue;

    insights.push({
      ...insight,
      symptom: c.symptom,
      metricType: c.metric,
      symptomAvg,
      baselineAvg,
      delta: symptomAvg - baselineAvg,
      confidence: correlationConfidence.calculateConfidence(symptomStats.count),
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

  // Diurnal BP from daily_metric_series
  const BP_DURNAL_METRIC = "blood_pressure_systolic";

  if (BP_DURNAL_METRIC === "blood_pressure_systolic") {
	  const morningBp = await insightsModel.getBpDiurnalStats({
		userId,
		metric: BP_DURNAL_METRIC,
		timeOfDay: "morning",
		from,
		to
    });

	  const eveningBp = await insightsModel.getBpDiurnalStats({
		userId,
		metric: BP_DURNAL_METRIC,
		timeOfDay: "evening",
		from,
		to
	  });

	  const diurnalInsight = interpretBpDiurnal(morningBp, eveningBp);
	  if (diurnalInsight) insights.push(diurnalInsight);
  }

  

  return {
    clinicalSummary: buildClinicalSummaryCard(insights, from, to),
    insights
  };
}

module.exports = { getInsightCards };
