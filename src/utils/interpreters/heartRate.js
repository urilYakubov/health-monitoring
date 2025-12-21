const { calculateConfidence } = require("../confidence");

exports.interpretHeartRate = (symptomStats, baselineStats) => {
  if (!symptomStats || symptomStats.count < 3) return null;

  const delta = symptomStats.avg - baselineStats.avg;
  if (delta >= 10) {
    return {
      metric: "Heart Rate",
      icon: "❤️",
      message: `Heart rate was higher on symptom days.`,
      confidence: calculateConfidence(symptomStats.count)
    };
  }
  return null;
};
