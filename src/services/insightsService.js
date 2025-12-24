const insightsModel = require("../models/insightsModel");
const interpreters = require("../utils/interpreters");
const confidence = require("../utils/confidence");
const { buildClinicalSentence } = require("../utils/clinicalSentence");


async function getInsightCards(userId, startDate, endDate) {
  const insights = [];

  // Default date range (last 30 days)
  const from = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = endDate || new Date();

  /**
   * Example correlations we support
   * We can extend this array easily later
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
    const symptomStats =
      await insightsModel.getMetricStatsForSymptomDays(
        userId,
        c.symptom,
        c.metric,
        c.minSeverity,
        from,
        to
      );

    // not enough data → skip
    if (!symptomStats || symptomStats.count < 3) continue;

    const baselineStats =
      await insightsModel.getMetricStatsForBaselineDays(
        userId,
        c.metric,
        from,
        to
      );

    if (!baselineStats || baselineStats.count < 3) continue;
	
	const symptomAvg = Math.round(symptomStats.avg);
	const baselineAvg = Math.round(baselineStats.avg);
	const delta = symptomAvg - baselineAvg;

    const interpreter = interpreters[c.metric];
    if (!interpreter) continue;

    const insight = interpreter(symptomStats, baselineStats);
    if (insight) {
	  insights.push({
		...insight,
		symptom: c.symptom,
		metricType: c.metric,
		symptomAvg,
		baselineAvg,
		delta,
		confidence: confidence.calculateConfidence(symptomStats.count),
		sampleSize: symptomStats.count,
		
		// 👇 Clinical sentence
		clinicalSummary: buildClinicalSentence({
		  symptom: c.symptom,
		  metric: c.metric,
		  symptomAvg,
		  baselineAvg,
		  count: symptomStats.count
		})
	  });
	}
	
  }

  return insights;
}

module.exports = {
  getInsightCards
};

