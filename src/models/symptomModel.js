// src/models/symptomModel.js

const pool = require("../config/db");

exports.saveSymptom = async (data) => {
  const { user_id, symptom, severity, notes } = data;

  const result = await pool.query(
    `
    INSERT INTO user_symptoms (user_id, symptom, severity, notes, recorded_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING *;
    `,
    [user_id, symptom, severity, notes]
  );

  return result.rows[0];
};

exports.getUserSymptoms = async (user_id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM user_symptoms
    WHERE user_id = $1
    ORDER BY recorded_at DESC;
    `,
    [user_id]
  );

  return result.rows;
};

// ✅ Duplicate check
exports.checkDuplicateSymptom = async ({
  userId,
  symptom,
  windowMinutes = 30
}) => {
  const result = await pool.query(
    `
    SELECT id
    FROM user_symptoms
    WHERE user_id = $1
      AND LOWER(symptom) = LOWER($2)
      AND recorded_at > NOW() - ($3 * INTERVAL '1 minute')
    LIMIT 1;
    `,
    [userId, symptom, windowMinutes]
  );

  return result.rows.length > 0;
};
