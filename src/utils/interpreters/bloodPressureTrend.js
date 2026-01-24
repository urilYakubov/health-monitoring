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
    message = `${label} blood pressure showed a gradual upward trend over the past ${windowDays} days (from ~${details.fromAvg} to ~${details.toAvg} mmHg).`;
  } else if (direction === "decreasing") {
    message = `${label} blood pressure showed a gradual downward trend over the past ${windowDays} days (from ~${details.fromAvg} to ~${details.toAvg} mmHg).`;
  } else {
    message = `${label} blood pressure remained stable over the past ${windowDays} days (from ~${details.fromAvg} to ~${details.toAvg} mmHg).`;
  }
  
  if (direction === "stable" && Math.abs(trend.slope) >= 0.5) {
	  message = 
		`${label} blood pressure fluctuated over the past ${windowDays} days without a consistent upward or downward trend.`;
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
