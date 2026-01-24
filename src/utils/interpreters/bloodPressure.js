
exports.interpretBloodPressure = (symptomStats, baselineStats, type) => {
  if (!symptomStats || !baselineStats) return null;
  if (symptomStats.count < 2 || baselineStats.count < 3) return null;

  const delta = Math.round(symptomStats.avg - baselineStats.avg);

  const threshold = type === "systolic" ? 10 : 4;

  if (Math.abs(delta) < threshold) return null;

  const metricLabel =
    type === "systolic"
      ? "Blood Pressure (Systolic)"
      : "Blood Pressure (Diastolic)";

  return {
    metric: metricLabel,
    icon: "🩸",
    level: delta >= threshold ? "info" : "neutral",
    message:
      `${metricLabel} was on average ${Math.abs(delta)} mmHg ` +
      `${delta > 0 ? "higher" : "lower"} on selected days compared to baseline.`,
    delta
  };
};

