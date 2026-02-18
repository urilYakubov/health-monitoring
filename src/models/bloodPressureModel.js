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
  const result = await pool.query(
    `
    INSERT INTO blood_pressure_readings
    (user_id, systolic, diastolic, measured_at, time_of_day, posture, device)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    `,
    [userId, systolic, diastolic, measuredAt, timeOfDay, posture, device]
  );
  return result.rows[0];
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

exports.getBpTrendData = async ({
  userId,
  metric,
  timeOfDay,
  from,
  to
}) => {
  const column =
    metric === "blood_pressure_systolic"
      ? "avg_systolic"
      : "avg_diastolic";

  let timeFilter = "";
  const params = [userId, from, to];

  if (timeOfDay) {
    timeFilter = "AND time_of_day = $4";
    params.push(timeOfDay);
  }

  const query = `
    SELECT
      date,
      ${column} AS value
    FROM daily_blood_pressure
    WHERE user_id = $1
      AND date BETWEEN $2 AND $3
      ${timeFilter}
    ORDER BY date ASC
  `;

  const { rows } = await pool.query(query, params);
  return rows;
};

exports.duplicateCheck = async ({
  userId,
  systolic,
  diastolic
}) => {
  const result = await pool.query(
    `
    SELECT id FROM blood_pressure_readings
    WHERE user_id = $1
      AND systolic = $2
      AND diastolic = $3
      AND measured_at > NOW() - INTERVAL '2 minutes'
    `,
    [userId, systolic, diastolic]
  );

  return result.rows;
};



