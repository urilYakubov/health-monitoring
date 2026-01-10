const bpModel = require("../models/bloodPressureModel");

const WINDOW_DAYS = 14;

exports.getBpTrend = async ({
  userId,
  metric,
  timeOfDay
}) => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - WINDOW_DAYS);

  const rows = await bpModel.getBpTrendData({
    userId,
    metric,
    timeOfDay,
    from,
    to
  });

  if (!rows || rows.length < 6) return null;

  const half = Math.floor(rows.length / 2);
  const first = rows.slice(0, half);
  const second = rows.slice(half);

  const avg = (arr) =>
    arr.reduce((sum, r) => sum + r.value, 0) / arr.length;

  const fromAvg = avg(first);
  const toAvg = avg(second);

  const slope = (toAvg - fromAvg) / WINDOW_DAYS;

  let direction = "stable";
  if (Math.abs(toAvg - fromAvg) >= 2) {
    direction = toAvg > fromAvg ? "increasing" : "decreasing";
  }

  return {
    metric,
    timeOfDay,
    windowDays: WINDOW_DAYS,
    slope,
    direction,
    fromAvg,
    toAvg
  };
};
