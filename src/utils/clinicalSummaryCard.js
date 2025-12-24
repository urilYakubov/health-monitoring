function formatDate(date) {
  if (!date) return null;

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().split("T")[0];
}


function capitalize(text) {
  return text.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

exports.buildClinicalSummaryCard = (insights, from, to) => {
  if (!Array.isArray(insights) || insights.length === 0) return null;

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
  const toDate = to ? new Date(to) : new Date();

  const symptomsMap = {};
  const findings = [];

  insights.forEach(i => {
    // Aggregate symptoms
    if (!symptomsMap[i.symptom]) {
      symptomsMap[i.symptom] = {
        name: capitalize(i.symptom),
        daysReported: i.sampleSize,
        minSeverity: 3
      };
    }

    findings.push({
      metric: capitalize(i.metricType),
      unit: i.metricType.includes("heart_rate") ? "bpm" : "mmHg",
      symptom: capitalize(i.symptom),
      baselineAvg: i.baselineAvg,
      symptomAvg: i.symptomAvg,
      delta: i.symptomAvg - i.baselineAvg,
      confidence: i.confidence,
      sampleSize: i.sampleSize
    });
  });

  const interpretation = findings.map(f =>
    `${f.metric} showed a consistent elevation on days with ${f.symptom.toLowerCase()} (+${f.delta} ${f.unit} vs baseline).`
  );

  return {
    type: "clinical_summary",
    title: "Clinical Summary (Last 30 Days)",
    period: {
      from: formatDate(fromDate),
      to: formatDate(toDate)
    },
    dataSources: [
      "Patient-reported symptoms",
      "Wearable / manual metrics"
    ],
    symptoms: Object.values(symptomsMap),
    findings,
    interpretation,
    discussionPoints: [
      "Are symptom-related metric changes clinically significant?",
      "Is further monitoring or testing recommended?"
    ],
    disclaimer:
      "This summary is informational only and does not constitute a medical diagnosis."
  };
};
