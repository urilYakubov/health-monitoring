const pool = require("../config/db");

exports.getMetricStatsForSymptomDays = async (
  userId,
  symptom,
  metricType,
  minSeverity,
  startDate,
  endDate
) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS count,
      AVG(m.value) AS avg,
      MIN(m.value) AS min,
      MAX(m.value) AS max
    FROM user_symptoms s
    JOIN health_data m
      ON DATE(s.recorded_at) = DATE(m.recorded_at)
    WHERE s.user_id = $1
      AND s.symptom = $2
      AND s.severity >= $3
      AND m.metric_type = $4
      AND s.recorded_at BETWEEN $5 AND $6
  `, [userId, symptom, minSeverity, metricType, startDate, endDate]);

  return result.rows[0];
};

exports.getMetricStatsForBaselineDays = async (
  userId,
  metricType,
  startDate,
  endDate
) => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS count,
      AVG(value) AS avg,
      MIN(value) AS min,
      MAX(value) AS max
    FROM health_data
    WHERE user_id = $1
      AND metric_type = $2
      AND recorded_at BETWEEN $3 AND $4
  `, [userId, metricType, startDate, endDate]);

  return result.rows[0];
};
