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
     AND DATE(s.recorded_at) = d.date
    WHERE d.user_id = $1
      AND d.metric = $2
      AND s.symptom = $3
      AND s.severity >= $4
      AND d.date BETWEEN $5 AND $6
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
      AND d.date BETWEEN $3 AND $4
      AND NOT EXISTS (
        SELECT 1
        FROM user_symptoms s
        WHERE s.user_id = d.user_id
          AND DATE(s.recorded_at) = d.date
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
  timeOfDay,
  from,
  to
}) => {
  const column =
    metric === "blood_pressure_systolic"
      ? "systolic"
      : "diastolic";

  const { rows } = await pool.query(`
    SELECT
      COUNT(*) AS count,
      AVG(${column}) AS avg,
      MIN(${column}) AS min,
      MAX(${column}) AS max
    FROM blood_pressure_readings
    WHERE user_id = $1
      AND time_of_day = $2
      AND measured_at BETWEEN $3 AND $4
  `, [userId, timeOfDay, from, to]);

  return rows[0];
};

