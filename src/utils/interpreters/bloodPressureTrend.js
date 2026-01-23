// src/utils/interpreters/bloodPressureTrend.js

exports.interpretBpTrend = (trend) => {
  if (!trend || trend.confidence === "low") return null;

  const {
    metric,
    direction,
    windowDays,
    details
  } = trend;

  const isSystolic = metric === "blood_pressure_systolic";
  const label = isSystolic ? "Systolic" : "Diastolic";

  let message;

  if (direction === "increasing") {
    message = `${label} blood pressure showed a gradual upward trend over the past ${windowDays} days.`;
  } else if (direction === "decreasing") {
    message = `${label} blood pressure showed a gradual downward trend over the past ${windowDays} days.`;
  } else {
    message = `${label} blood pressure remained stable over the past ${windowDays} days.`;
  }

  return {
    type: "bp_trend",
    title: `Blood Pressure Trend (${label})`,
    icon: "📈",
    confidence: trend.confidence,
    message,
    details: {
      fromAvg: Math.round(details.fromAvg),
      toAvg: Math.round(details.toAvg),
      windowDays
    },
    disclaimer:
      "Trends are descriptive only and do not indicate a diagnosis or treatment recommendation."
  };
};
