const insightsModel = require("../models/insightsModel");
const interpreters = require("../utils/interpreters");
const confidence = require("../utils/confidence");
const { buildClinicalSentence } = require("../utils/clinicalSentence");
const { buildClinicalSummaryCard } = require("../utils/clinicalSummaryCard");
const bpModel = require("../models/bloodPressureModel");
const { interpretBpDiurnal } = require("../utils/interpreters/bloodPressureDiurnal");

async function getInsightCards(userId, startDate, endDate) {
  const insights = [];

  // Default date range (last 30 days)
  const from = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = endDate || new Date();

  /**
   * Supported correlations
   */
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
    let symptomStats;
    let baselineStats;

    /**
     * 👇 Blood pressure → use DAILY AGGREGATES
     */
    if (c.metric.startsWith("blood_pressure")) {
      symptomStats =
        await insightsModel.getBpAggregateStatsForSymptomDays(
          userId,
          c.symptom,
          c.metric,
          c.minSeverity,
          from,
          to
        );

      baselineStats =
        await insightsModel.getBpAggregateStatsForBaselineDays(
          userId,
          c.metric,
          from,
          to
        );
    } else {
      /**
       * 👇 Other metrics (heart rate etc.)
       */
      symptomStats =
        await insightsModel.getMetricStatsForSymptomDays(
          userId,
          c.symptom,
          c.metric,
          c.minSeverity,
          from,
          to
        );

      baselineStats =
        await insightsModel.getMetricStatsForBaselineDays(
          userId,
          c.metric,
          from,
          to
        );
    }

    // Not enough data → skip
    if (
      !symptomStats ||
      !baselineStats ||
      symptomStats.count < 3 ||
      baselineStats.count < 3
    ) {
      continue;
    }

    const symptomAvg = Math.round(symptomStats.avg);
    const baselineAvg = Math.round(baselineStats.avg);
    const delta = symptomAvg - baselineAvg;

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
      delta,
      confidence: confidence.calculateConfidence(symptomStats.count),
      sampleSize: symptomStats.count,

      // Clinical sentence
      clinicalSentence: buildClinicalSentence({
        symptom: c.symptom,
        metric: c.metric,
        symptomAvg,
        baselineAvg,
        count: symptomStats.count
      })
    });
  }
  
    /**
   * 🕘 Diurnal Blood Pressure Insight (Morning vs Evening)
   */
  const morning = await bpModel.getBpByTimeOfDay({
    userId,
    from,
    to,
    timeOfDay: "morning"
  });

  const evening = await bpModel.getBpByTimeOfDay({
    userId,
    from,
    to,
    timeOfDay: "evening"
  });

  const diurnalInsight = interpretBpDiurnal(morning, evening);

  if (diurnalInsight) {
    insights.push({
      ...diurnalInsight,
      metricType: "blood_pressure_systolic",
      confidence: confidence.calculateConfidence(
        Math.min(morning.count || 0, evening.count || 0)
      ),
      clinicalSentence: `Morning systolic blood pressure averaged ${Math.round(
        morning.avg
      )} mmHg compared to ${Math.round(
        evening.avg
      )} mmHg in the evening.`
    });
  }


  const clinicalSummary = buildClinicalSummaryCard(insights, from, to);

  return {
    clinicalSummary,
    insights
  };
}

module.exports = {
  getInsightCards
};
