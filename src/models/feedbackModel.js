const pool = require("../config/db");

async function saveFeedback(userId, message) {
  await pool.query(
    `INSERT INTO feedback (user_id, message, created_at)
     VALUES ($1, $2, NOW())`,
    [userId, message]
  );
}

module.exports = { saveFeedback };