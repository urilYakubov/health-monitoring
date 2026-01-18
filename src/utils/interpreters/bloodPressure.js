
exports.interpretBloodPressure = (symptomStats, baselineStats, type) => {
  if (!symptomStats || symptomStats.count < 3) return null;

  const delta = symptomStats.avg - baselineStats.avg;

  // thresholds differ by BP type
  const threshold = type === "systolic" ? 10 : 5;

  if (delta >= threshold) {
    return {
      metric: type === "systolic"
        ? "Blood Pressure (Systolic)"
        : "Blood Pressure (Diastolic)",
      icon: "🩸",
      message: `${type} blood pressure was higher on symptom days.`
    };
  }

  return null;
};
