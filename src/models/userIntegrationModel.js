const pool = require('../config/db');

async function saveIntegration(userId, provider, accessToken, refreshToken, expiresAt) {
  const res = await pool.query(
    `INSERT INTO user_integrations (
      user_id, provider, access_token, refresh_token, expires_at, created_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (user_id, provider)
    DO UPDATE SET access_token = EXCLUDED.access_token,
                  refresh_token = EXCLUDED.refresh_token,
                  expires_at = EXCLUDED.expires_at,
                  updated_at = NOW()
    RETURNING *`,
    [userId, provider, accessToken, refreshToken, expiresAt]
  );
  return res.rows[0];
}

async function getIntegration(userId, provider) {
  const res = await pool.query(
    `SELECT * FROM user_integrations
     WHERE user_id = $1 AND provider = $2
     LIMIT 1`,
    [userId, provider]
  );
  return res.rows[0];
}

module.exports = { saveIntegration, getIntegration };