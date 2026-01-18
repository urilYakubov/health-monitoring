const bpModel = require("../models/bloodPressureModel");
const { computeSlope } = require("../utils/trendMath");
const {
  computeConfidence
} = require("../utils/confidence/bpTrendConfidence");


exports.getBpTrend = async ({
  userId,
  metric,
  timeOfDay,
  windowDays = 14
}) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - windowDays);

  const series = await bpModel.getBpTrendData({
    userId,
    metric,
    timeOfDay,
    from,
    to
  });

  if (series.length < 7) {
    return {
      metric,
      confidence: "low",
      reason: "insufficient_data"
    };
  }

  const values = series.map(r => Number(r.value));
  const dates = series.map(r => new Date(r.date));

  const slope = computeSlope(values);
  const direction =
    slope > 0.3 ? "increasing" :
    slope < -0.3 ? "decreasing" :
    "stable";

  const confidence = computeConfidence({
    values,
    dates,
    slope
  });

  return {
    metric,
    timeOfDay,
    windowDays,
    slope,
    direction,
    confidence,
    fromAvg: values[0],
    toAvg: values[values.length - 1]
  };
};