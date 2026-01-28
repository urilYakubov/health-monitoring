// src/models/medicationModel.js
const pool = require("../config/db");

exports.insertMedication = async ({
  userId,
  name,
  category,
  dose,
  frequency,
  started_at,
  ended_at,
  prescribed_by,
  notes
}) => {
  const { rows } = await pool.query(
    `
    INSERT INTO user_medications (
      user_id,
      name,
      category,
      dose,
      frequency,
      started_at,
      ended_at,
      prescribed_by,
      notes
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [
      userId,
      name,
      category,
      dose,
      frequency,
      started_at,
      ended_at || null,
      prescribed_by,
      notes
    ]
  );

  return rows[0];
};

exports.getMedicationsInRange = async ({ userId, from, to }) => {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM user_medications
    WHERE user_id = $1
      AND started_at <= $3
      AND (ended_at IS NULL OR ended_at >= $2)
    ORDER BY started_at ASC
    `,
    [userId, from, to]
  );

  return rows;
};

exports.getMedicationsByUser = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT id,
	name,
	dose,
	frequency,
	started_at::text AS started_at,
    ended_at::text AS ended_at
    FROM user_medications
    WHERE user_id = $1
    ORDER BY started_at DESC
    `,
    [userId]
  );

  return rows;
};

exports.getBpAffectingMedications = async ({ userId }) => {
  const { rows } = await pool.query(
    `
    SELECT name, started_at
    FROM user_medications
    WHERE user_id = $1
      AND affects_metrics @> ARRAY['blood_pressure']
      AND (ended_at IS NULL)
    ORDER BY started_at ASC
    `,
    [userId]
  );

  return rows;
};
