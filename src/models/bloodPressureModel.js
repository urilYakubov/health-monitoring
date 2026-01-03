const pool = require("../config/db");

exports.insertReading = async ({
  userId,
  systolic,
  diastolic,
  measuredAt,
  timeOfDay,
  posture,
  device
}) => {
  await pool.query(
    `
    INSERT INTO blood_pressure_readings
    (user_id, systolic, diastolic, measured_at, time_of_day, posture, device)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [userId, systolic, diastolic, measuredAt, timeOfDay, posture, device]
  );
};

exports.getDailyStats = async (userId, date) => {
  const result = await pool.query(
    `
    SELECT
      AVG(systolic) AS avg_systolic,
      AVG(diastolic) AS avg_diastolic,
      COUNT(*) AS count
    FROM blood_pressure_readings
    WHERE user_id = $1
      AND DATE(measured_at) = $2
    `,
    [userId, date]
  );

  return result.rows[0];
};

exports.upsertDailyAggregation = async ({
  userId,
  date,
  avgSystolic,
  avgDiastolic,
  count
}) => {
  await pool.query(
    `
    INSERT INTO daily_blood_pressure
    (user_id, date, avg_systolic, avg_diastolic, readings_count)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      avg_systolic = EXCLUDED.avg_systolic,
      avg_diastolic = EXCLUDED.avg_diastolic,
      readings_count = EXCLUDED.readings_count
    `,
    [userId, date, avgSystolic, avgDiastolic, count]
  );
};
