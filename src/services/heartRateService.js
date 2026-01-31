const dailyMetricModel = require("../models/dailyMetricModel");

exports.getMeanHeartRate = async ({ userId, from, to }) => {
  const rows = await dailyMetricModel.getDailySeries({
    userId,
    metric: "heart_rate",
    from,
    to
  });

  if (!rows || rows.length === 0) return null;

  const values = rows.map(r => Number(r.value)).filter(v => !isNaN(v));
  if (values.length === 0) return null;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    metric: "heart_rate",
    mean: Math.round(mean),
    unit: "bpm",
    days: values.length
  };
};
