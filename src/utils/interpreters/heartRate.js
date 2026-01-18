
exports.interpretHeartRate = (symptomStats, baselineStats) => {
  if (!symptomStats || !baselineStats) return null;

  if (symptomStats.count < 3 || baselineStats.count < 7) {
    return {
      metric: "Heart Rate",
      icon: "❤️",
      confidence: "low",
      message: "Not enough data to determine a clear pattern."
    };
  }

  const delta = symptomStats.avg - baselineStats.avg;
  const absDelta = Math.abs(delta);

  // noise floor
  if (absDelta < 2) {
    return {
      metric: "Heart Rate",
      icon: "❤️",
      confidence: "very_low",
      message: "Heart rate showed no meaningful change on symptom days."
    };
  }

  let confidence = "medium";
  if (absDelta >= 5 && symptomStats.count >= 7) confidence = "high";

  return {
    metric: "Heart Rate",
    icon: "❤️",
    confidence,
    message:
      delta > 0
        ? "Heart rate tended to be higher on symptom days."
        : "Heart rate tended to be lower on symptom days."
  };
};


