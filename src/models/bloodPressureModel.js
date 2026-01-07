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

exports.getDailyStatsByTimeOfDay = async (userId, date, timeOfDay) => {
  const result = await pool.query(
    `
    SELECT
	  COUNT(*)::int AS count,
      AVG(systolic) AS avg_systolic,
      AVG(diastolic) AS avg_diastolic
    FROM blood_pressure_readings
    WHERE user_id = $1
      AND DATE(measured_at) = $2
	  AND time_of_day = $3
	  
    `,
    [userId, date, timeOfDay]
  );

  return result.rows[0];
};

exports.upsertDailyAggregation = async ({
  userId,
  date,
  timeOfDay,
  avgSystolic,
  avgDiastolic,
  readings_count
}) => {
  await pool.query(
    `
    INSERT INTO daily_blood_pressure
    (user_id, date, time_of_day, avg_systolic, avg_diastolic, readings_count)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (user_id, date, time_of_day)
    DO UPDATE SET
      avg_systolic = EXCLUDED.avg_systolic,
      avg_diastolic = EXCLUDED.avg_diastolic,
      readings_count = EXCLUDED.readings_count
    `,
    [userId, date, timeOfDay, avgSystolic, avgDiastolic, readings_count]
  );
};

exports.getBpByTimeOfDay = async ({ userId, from, to, timeOfDay }) => {
  const query = `
    SELECT
      COUNT(*)::int AS count,
      AVG(systolic)::float AS avg
    FROM blood_pressure_readings
    WHERE user_id = $1
      AND time_of_day = $2
	  AND measured_at >= $3
      AND measured_at < ($4::date + INTERVAL '1 day')
  `;

  const { rows } = await pool.query(query, [
    userId,
    timeOfDay,
    from,
    to
  ]);

  return rows[0];
};



