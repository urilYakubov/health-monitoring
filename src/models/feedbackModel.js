const pool = require("../config/db");

async function saveFeedback(userId, category, message) {
  await pool.query(
    `INSERT INTO feedback (user_id, category, message, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [userId, category, message]
  );
}

module.exports = { saveFeedback };