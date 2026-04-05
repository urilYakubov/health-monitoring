const pool = require('../config/db');

async function addAlert({ userId, metricType, value, reason }) {
  const result = await pool.query(
    `INSERT INTO alerts (user_id, metric_type, value, reason, created_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [userId, metricType, value, reason]
  );
  return result.rows[0];
}

async function getAlertsByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM alerts WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function acknowledge(alertId, doctorId) {
  const result = await pool.query(
    `
    UPDATE alerts
    SET 
      acknowledged_at = NOW(),
      acknowledged_by = $2,
      status = 'acknowledged'
    WHERE id = $1
    RETURNING *;
    `,
    [alertId, doctorId]
  );

  return result.rows[0];
}

async function acknowledgeAllForPatient(patientId, doctorId) {
  const result = await pool.query(
    `
    UPDATE alerts
    SET 
      acknowledged_at = NOW(),
      acknowledged_by = $2,
      status = 'acknowledged'
    WHERE user_id = $1
      AND acknowledged_at IS NULL
    RETURNING *;
    `,
    [patientId, doctorId]
  );

  return result.rows;
}

async function getActiveAlertsByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM alerts 
     WHERE user_id = $1 
       AND acknowledged_at IS NULL
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

module.exports = {
  addAlert,
  getAlertsByUser,
  acknowledge,
  acknowledgeAllForPatient,
  getActiveAlertsByUser
};