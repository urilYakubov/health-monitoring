const pool = require('../config/db');

async function addMetric(userId, metricType, value, alert) {
  const res = await pool.query(
    `INSERT INTO health_data (
      user_id,
      metric_type,
      value,
      alert,
      recorded_at
    ) VALUES ($1, $2, $3, $4, NOW())
    RETURNING *`,
    [userId, metricType, value, alert] // ✅ 4 values
  );
  return res.rows[0];
}

async function getMetricsByUser(userId) {
  const res = await pool.query(
    'SELECT * FROM health_data WHERE user_id = $1 ORDER BY recorded_at DESC',
    [userId]
  );
  return res.rows;
}

async function getRecentMetricValues(userId, metricType, limit = 10) {
  const res = await pool.query(
    `SELECT value FROM health_data
     WHERE user_id = $1 AND metric_type = $2
     ORDER BY recorded_at DESC
     LIMIT $3`,
    [userId, metricType, limit]
  );
  return res.rows.map(r => parseFloat(r.value));
}

module.exports = { addMetric, getMetricsByUser, getRecentMetricValues };
