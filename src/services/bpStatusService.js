const dailyMetricModel = require("../models/dailyMetricModel");

exports.computeBpStatus = async ({ userId, windowDays = 7 }) => {

  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - windowDays);

  const systolicSeries = await dailyMetricModel.getDailySeries({
    userId,
    metric: "blood_pressure_systolic",
    from,
    to
  });

  const diastolicSeries = await dailyMetricModel.getDailySeries({
    userId,
    metric: "blood_pressure_diastolic",
    from,
    to
  });

  if (!systolicSeries.length || !diastolicSeries.length) {
    return {
      status: "unknown",
      reason: "insufficient_data"
    };
  }

  const systolicValues = systolicSeries.map(v => Number(v.value));
  const diastolicValues = diastolicSeries.map(v => Number(v.value));

  const meanSys =
    systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length;

  const meanDia =
    diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length;

  let status = "normal";

  if (meanSys >= 180 || meanDia >= 120) {
    status = "critical";
  } else if (meanSys >= 140 || meanDia >= 90) {
    status = "high";
  } else if (meanSys >= 130 || meanDia >= 80) {
    status = "elevated";
  }

  return {
    type: "bp_status",
    status,
    meanSys: Number(meanSys.toFixed(1)),
    meanDia: Number(meanDia.toFixed(1)),
    windowDays
  };
};