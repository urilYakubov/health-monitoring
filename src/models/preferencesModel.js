const db = require("../config/db");

exports.getByUserId = async (userId) => {
  const res = await db.query(
    "SELECT * FROM user_preferences WHERE user_id = $1",
    [userId]
  );
  return res.rows[0];
};

exports.createDefault = async (userId) => {
  const res = await db.query(
    `INSERT INTO user_preferences (user_id)
     VALUES ($1)
     RETURNING *`,
    [userId]
  );
  return res.rows[0];
};

exports.upsert = async ({ userId, weight_unit, temperature_unit }) => {
  const res = await db.query(
    `
    INSERT INTO user_preferences (user_id, weight_unit, temperature_unit)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id)
    DO UPDATE SET
      weight_unit = EXCLUDED.weight_unit,
      temperature_unit = EXCLUDED.temperature_unit,
      updated_at = NOW()
    RETURNING *
    `,
    [userId, weight_unit, temperature_unit]
  );

  return res.rows[0];
};