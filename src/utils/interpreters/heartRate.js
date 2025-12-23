
exports.interpretHeartRate = (symptomStats, baselineStats) => {
  if (!symptomStats || symptomStats.count < 3) return null;

  const delta = symptomStats.avg - baselineStats.avg;

  if (delta >= 10) {
    return {
      metric: "Heart Rate",
      icon: "❤️",
      level: "warning",
      message: "Heart rate was higher on symptom days."
    };
  }

  return null;
};

