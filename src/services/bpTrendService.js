const dailyMetricModel = require("../models/dailyMetricModel");
const { computeSlope } = require("../utils/trendMath");
const {
  computeConfidence
} = require("../utils/confidence/bpTrendConfidence");

exports.computeBpTrend = async ({
  userId,
  metric,              // blood_pressure_systolic | diastolic
  windowDays = 14
}) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - windowDays);

  const series = await dailyMetricModel.getDailySeries({
    userId,
    metric,
    from,
    to
  });

  // ⛑️ Safety guard
  if (!series || series.length < 7) {
    return {
      metric,
      direction: "unknown",
      confidence: "low",
      reason: "insufficient_data"
    };
  }

  const values = series.map(r => Number(r.value));
  const dates = series.map(r => r.date);

  const slope = computeSlope(values);

  // 👩‍⚕️ Conservative thresholds (cardiologist-safe)
  let direction = "stable";
  if (slope >= 0.5) direction = "increasing";
  if (slope <= -0.5) direction = "decreasing";

  const confidence = computeConfidence({
    values,
    dates,
    slope
  });

  return {
    type: "bp_trend",
    metric,
    windowDays,
    slope: Number(slope.toFixed(2)),
    direction,
    confidence,
    details: {
      fromAvg: values[0],
      toAvg: values[values.length - 1]
    }
  };
};
