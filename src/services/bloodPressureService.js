const bpModel = require("../models/bloodPressureModel");
const { createMetricInternal } = require("./metricService");

exports.recordBloodPressure = async ({
  userId,
  systolic,
  diastolic,
  measuredAt,
  timeOfDay,
  posture,
  device
}) => {
  const date = measuredAt.toISOString().split("T")[0];

  // Save raw reading with context
  await bpModel.insertReading({
    userId,
    systolic,
    diastolic,
    measuredAt,
    timeOfDay,
    posture,
    device
  });

  await createMetricInternal({
    userId,
    metricType: "blood_pressure_systolic",
    value: systolic
  });

  await createMetricInternal({
    userId,
    metricType: "blood_pressure_diastolic",
    value: diastolic
  });
  
  // Recalculate daily aggregation
  const stats = await bpModel.getDailyStats(userId, date);

  await bpModel.upsertDailyAggregation({
    userId,
    date,
    avgSystolic: Math.round(stats.avg_systolic),
    avgDiastolic: Math.round(stats.avg_diastolic),
    count: stats.count
  });

};
