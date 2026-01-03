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

/**
 * BP stats for days WITH symptom
 */
exports.getBpAggregateStatsForSymptomDays = async (
  userId,
  symptom,
  metric,
  minSeverity,
  from,
  to
) => {
  const columnMap = {
    blood_pressure_systolic: "avg_systolic",
    blood_pressure_diastolic: "avg_diastolic"
  };

  const column = columnMap[metric];
  if (!column) {
    throw new Error(`Unsupported BP metric: ${metric}`);
  }

  const query = `
    SELECT
      COUNT(*) AS count, -- number of days
      AVG(${column}) AS avg
    FROM daily_blood_pressure bp
    JOIN user_symptoms s
      ON s.user_id = bp.user_id
     AND DATE(s.recorded_at) = bp.date
    WHERE bp.user_id = $1
      AND s.symptom = $2
      AND s.severity >= $3
      AND bp.date BETWEEN $4 AND $5
  `;

  const { rows } = await pool.query(query, [
    userId,
    symptom,
    minSeverity,
    from,
    to
  ]);

  return rows[0];
};

/**
 * BP stats for BASELINE days (no symptom)
 */
exports.getBpAggregateStatsForBaselineDays = async (
  userId,
  metric,
  from,
  to
) => {
  const columnMap = {
    blood_pressure_systolic: "avg_systolic",
    blood_pressure_diastolic: "avg_diastolic"
  };

  const column = columnMap[metric];
  if (!column) {
    throw new Error(`Unsupported BP metric: ${metric}`);
  }

  const query = `
    SELECT
      COUNT(*) AS count, -- number of days
      AVG(${column}) AS avg
    FROM daily_blood_pressure bp
    WHERE bp.user_id = $1
      AND bp.date BETWEEN $2 AND $3
      AND NOT EXISTS (
        SELECT 1
        FROM user_symptoms s
        WHERE s.user_id = bp.user_id
          AND DATE(s.recorded_at) = bp.date
      )
  `;

  const { rows } = await pool.query(query, [
    userId,
    from,
    to
  ]);

  return rows[0];
};
