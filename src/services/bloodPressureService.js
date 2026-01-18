/**
 * IMPORTANT ARCHITECTURE NOTE
 * ---------------------------
 * - Raw BP readings represent real physiological events
 *   → must go through createMetricInternal (alerts + trends)
 *
 * - Daily BP aggregates are analytical summaries only
 *   → must NOT be written to health_data
 *   → must NOT trigger alerts or notifications
 *
 * This separation preserves clinical accuracy and prevents false alerts.
 */

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
  const stats = await bpModel.getDailyStatsByTimeOfDay(userId, date, timeOfDay);

};
