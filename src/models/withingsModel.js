// models/withingsModel.js
const pool = require('../config/db');

async function saveUserIntegration(userId, provider, accessToken, refreshToken, expiresAt) {
  const res = await pool.query(
    `INSERT INTO user_integrations (user_id, provider, access_token, refresh_token, expires_at)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, provider) 
     DO UPDATE SET access_token=$3, refresh_token=$4, expires_at=$5
     RETURNING *`,
    [userId, provider, accessToken, refreshToken, expiresAt]
  );
  return res.rows[0];
}

module.exports = { saveUserIntegration };