// src/utils/interpreters/bloodPressureTrend.js

exports.interpretBpTrend = (trend) => {
  if (!trend) return null;

  const {
    metric,
    slope,
    direction,
    windowDays,
    timeOfDay,
    fromAvg,
    toAvg
  } = trend;

  const isSystolic = metric === "blood_pressure_systolic";
  const metricLabel = isSystolic ? "systolic" : "diastolic";

  let severity = "info";
  if (direction === "increasing" && Math.abs(slope) >= 1) {
    severity = "warning";
  }

  const timeLabel = timeOfDay ? `${timeOfDay} ` : "";

  let message;
  if (direction === "increasing") {
    message = `${timeLabel}${metricLabel} blood pressure has increased over the past ${windowDays} days.`;
  } else if (direction === "decreasing") {
    message = `${timeLabel}${metricLabel} blood pressure has decreased over the past ${windowDays} days.`;
  } else {
    message = `${timeLabel}${metricLabel} blood pressure has remained stable over the past ${windowDays} days.`;
  }

  return {
    type: "bp_trend",
    metric,
    severity,
    direction,
    slope,
    title: `Blood pressure trend (${metricLabel})`,
    message,
    details: {
      fromAvg,
      toAvg,
      windowDays,
      timeOfDay
    },
    recommendation:
      direction === "increasing"
        ? "Continue monitoring and consider discussing recent changes with your healthcare provider."
        : direction === "decreasing"
        ? "This trend suggests improving blood pressure control."
        : "No significant trend detected."
  };
};
