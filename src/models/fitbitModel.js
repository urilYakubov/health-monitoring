const pool = require('../config/db');

// Save access token in user_integrations table
async function saveUserIntegration(userId, provider, accessToken, refreshToken, expiresAt) {
  console.log("👉 saveUserIntegration called with:", { userId, provider, accessToken, refreshToken, expiresAt });
  try {
    const res = await pool.query(
      `INSERT INTO user_integrations (user_id, provider, access_token, refresh_token, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (user_id, provider)
       DO UPDATE SET access_token = EXCLUDED.access_token,
                     refresh_token = EXCLUDED.refresh_token,
                     expires_at = EXCLUDED.expires_at,
                     updated_at = NOW()
       RETURNING *`,
      [userId, provider, accessToken, refreshToken, expiresAt]
    );
    console.log("✅ Saved integration:", res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error("❌ Error saving integration:", err);
    throw err;
  }
}

// ✅ Get integration row for a user+provider (e.g. Fitbit)
async function getUserIntegration(userId, provider) {
  const res = await pool.query(
    `SELECT * FROM user_integrations WHERE user_id=$1 AND provider=$2 ORDER BY id DESC LIMIT 1`,
    [userId, provider]
  );
  return res.rows[0];
}


module.exports = { saveUserIntegration, getUserIntegration };