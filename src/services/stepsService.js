const dailyMetricModel = require("../models/dailyMetricModel");

exports.getStepsSummary = async ({ userId, from, to }) => {
  const rows = await dailyMetricModel.getDailySeries({
    userId,
    metric: "steps",
    from,
    to
  });

  if (!rows || rows.length === 0) return null;

  const values = rows.map(r => Number(r.value)).filter(v => !isNaN(v));
  if (values.length === 0) return null;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    metric: "steps",
    mean: Math.round(mean),
    unit: "steps/day",
    days: values.length
  };
};
