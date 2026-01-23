function formatDate(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function capitalize(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

exports.buildClinicalSummaryCard = (insights, from, to) => {
  if (!Array.isArray(insights) || insights.length === 0) return null;

  // ONLY correlation insights belong here
  const correlationInsights = insights.filter(
    i =>
      i.type === "correlation" &&
      typeof i.metricType === "string" &&
      typeof i.symptomAvg === "number" &&
      typeof i.baselineAvg === "number"
  );

  if (correlationInsights.length === 0) return null;

  const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
  const toDate = to ? new Date(to) : new Date();

  const symptomsMap = {};
  const findings = [];

  correlationInsights.forEach(i => {
    if (!symptomsMap[i.symptom]) {
      symptomsMap[i.symptom] = {
        name: capitalize(i.symptom),
        daysReported: i.sampleSize,
        minSeverity: 3
      };
    }

    const unit =
      i.metricType.includes("heart_rate")
        ? "bpm"
        : i.metricType.includes("blood_pressure")
        ? "mmHg"
        : "";

    findings.push({
      metric: capitalize(i.metricType),
      unit,
      symptom: capitalize(i.symptom),
      baselineAvg: i.baselineAvg,
      symptomAvg: i.symptomAvg,
      delta: i.symptomAvg - i.baselineAvg,
      confidence: i.confidence,
      sampleSize: i.sampleSize
    });
  });

  const interpretation = findings.map(f =>
    `${f.metric} showed higher values on days with ${f.symptom.toLowerCase()} (+${f.delta} ${f.unit} vs baseline).`
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
      "Are symptom-associated metric changes clinically meaningful?",
      "Should additional monitoring or diagnostics be considered?"
    ],
    disclaimer:
      "This summary is informational only and does not constitute a medical diagnosis."
  };
};

