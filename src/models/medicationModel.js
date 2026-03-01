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

exports.checkDuplicateMedication = async ({
  userId,
  name,
  started_at,
  ended_at
}) => {
  const { rows } = await pool.query(
    `
    SELECT id
    FROM user_medications
    WHERE user_id = $1
      AND LOWER(name) = LOWER($2)
      AND (
            (ended_at IS NULL)
            OR
            (ended_at >= $3)
          )
    LIMIT 1
    `,
    [userId, name, started_at]
  );

  return rows.length > 0;
};

exports.getBpEffectivenessStats = async (userId) => {
  const { rows } = await pool.query(
    `
    WITH med_periods AS (
      SELECT
        m.id,
        m.name,
        m.started_at,
        COALESCE(m.ended_at, NOW()) AS ended_at
      FROM user_medications m
      WHERE m.user_id = $1
        AND m.affects_metrics @> ARRAY['blood_pressure']
      ORDER BY m.started_at ASC
    )

    SELECT
      m.name,
      COUNT(b.id) AS readings_count,
      ROUND(AVG(b.systolic),1) AS avg_systolic,
      ROUND(AVG(b.diastolic),1) AS avg_diastolic,
      ROUND(STDDEV(b.systolic),1) AS systolic_sd,
      ROUND(
        100.0 * SUM(CASE WHEN b.systolic < 140 THEN 1 ELSE 0 END)
        / NULLIF(COUNT(b.id),0),1
      ) AS control_rate
    FROM med_periods m
    JOIN blood_pressure_readings b
      ON b.user_id = $1
     AND b.measured_at BETWEEN m.started_at AND m.ended_at
    GROUP BY m.name, m.started_at
    HAVING COUNT(b.id) >= 5
    ORDER BY m.started_at ASC
    `,
    [userId]
  );

  return rows;
};

