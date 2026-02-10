const pool = require("../config/db");

/**
 * Daily metric stats for days WITH symptom
 */
exports.getDailyMetricStatsForSymptomDays = async (
  userId,
  symptom,
  metric,
  minSeverity,
  from,
  to
) => {
  const query = `
    SELECT
	  COUNT(*) AS count,
	  AVG(d.avg_value) AS avg,
	  MIN(d.avg_value) AS min,
	  MAX(d.avg_value) AS max
	FROM daily_metric_series d
	JOIN user_symptoms s
	  ON s.user_id = d.user_id
	 AND s.recorded_at::date = d.date
	WHERE d.user_id = $1
	  AND d.metric = $2
	  AND s.symptom = $3
	  AND s.severity >= $4
	  AND d.date BETWEEN $5::date AND $6::date;
  `;

  const { rows } = await pool.query(query, [
    userId,
    metric,
    symptom,
    minSeverity,
    from,
    to
  ]);

  return rows[0];
};

/**
 * Daily metric stats for BASELINE days (no symptom)
 */
exports.getDailyMetricStatsForBaselineDays = async (
  userId,
  metric,
  from,
  to
) => {
  const query = `
    SELECT
      COUNT(*) AS count,
      AVG(d.avg_value) AS avg,
      MIN(d.avg_value) AS min,
      MAX(d.avg_value) AS max
    FROM daily_metric_series d
    WHERE d.user_id = $1
      AND d.metric = $2
      AND d.date BETWEEN $3::date AND $4::date
      AND NOT EXISTS (
        SELECT 1
        FROM user_symptoms s
        WHERE s.user_id = d.user_id
          AND s.recorded_at::date = d.date
      )
  `;

  const { rows } = await pool.query(query, [
    userId,
    metric,
    from,
    to
  ]);

  return rows[0];
};


exports.getBpDiurnalStats = async ({
  userId,
  metric, // 'blood_pressure_systolic' | 'blood_pressure_diastolic'
  timeOfDay, // 'morning' | 'afternoon' | 'evening' | 'night'
  from,
  to
}) => {
  const column =
    metric === "blood_pressure_systolic"
      ? "systolic"
      : "diastolic";

  const query = `
    SELECT
      COUNT(*) AS count,
      AVG(${column}) AS avg,
      MIN(${column}) AS min,
      MAX(${column}) AS max
    FROM blood_pressure_readings
    WHERE user_id = $1
      AND time_of_day = $2
      AND measured_at::date BETWEEN $3::date AND $4::date
  `;

  const { rows } = await pool.query(query, [
    userId,
    timeOfDay,
    from,
    to
  ]);

  return rows[0];
};


exports.getSymptomDateRange = async (userId) => {
  const query = `
    SELECT
      MIN(recorded_at::date) AS from,
      MAX(recorded_at::date) AS to
    FROM user_symptoms
    WHERE user_id = $1
  `;

  const { rows } = await pool.query(query, [userId]);

  if (!rows[0]?.from || !rows[0]?.to) {
    return null;
  }

  return {
    from: rows[0].from,
    to: rows[0].to
  };
};


exports.getBpVariability = async ({userId, from, to }) => {
  const result = await pool.query(`
    SELECT
      ROUND(STDDEV(avg_value)::numeric, 2) AS std_dev,
      ROUND(AVG(avg_value)::numeric, 1) AS mean_bp
    FROM daily_metric_series
    WHERE user_id = $1
      AND metric = 'blood_pressure_systolic'
      AND date BETWEEN $2 AND $3
  `, [userId, from, to]);

  return result.rows[0];
};


exports.getBpControlStats = async ({ userId, from, to }) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total_days,
      COUNT(*) FILTER (WHERE avg_value > 140) AS uncontrolled_days
    FROM daily_metric_series
    WHERE user_id = $1
      AND metric = 'blood_pressure_systolic'
      AND date BETWEEN $2 AND $3
  `, [userId, from, to]);

  return result.rows[0];
};


