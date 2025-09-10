const pool = require('../config/db');


async function logAnomaly({ userId, metricType, value, avg, stdDev, zScore, threshold }) {
  await pool.query(
    `INSERT INTO anomalies (
      user_id,
      metric_type,
      value,
      avg,
      std_dev,
      z_score,
      threshold,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [userId, metricType, value, avg, stdDev, zScore, threshold]
  );
}

module.exports = { logAnomaly };