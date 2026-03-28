const pool = require('../config/db');

async function upsert(userId, data) {
  const {
    date_of_birth,
    sex,
    height_cm,
    baseline_weight,
    nyha_class,
    lvef,
    diabetes,
    smoker,
    doctor_email,
    care_team_email,
    hospitalisations
  } = data;

  const result = await pool.query(
    `
    INSERT INTO clinical_profile (
      user_id,
      date_of_birth,
      sex,
      height_cm,
      baseline_weight,
      nyha_class,
      lvef,
      diabetes,
      smoker,
      doctor_email,
      care_team_email,
      hospitalisations
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (user_id)
    DO UPDATE SET
      date_of_birth = EXCLUDED.date_of_birth,
      sex = EXCLUDED.sex,
      height_cm = EXCLUDED.height_cm,
      baseline_weight = EXCLUDED.baseline_weight,
      nyha_class = EXCLUDED.nyha_class,
      lvef = EXCLUDED.lvef,
      diabetes = EXCLUDED.diabetes,
      smoker = EXCLUDED.smoker,
      doctor_email = EXCLUDED.doctor_email,
      care_team_email = EXCLUDED.care_team_email,
      hospitalisations = EXCLUDED.hospitalisations,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
    `,
    [
      userId,
      date_of_birth,
      sex,
      height_cm,
      baseline_weight,
      nyha_class,
      lvef,
      diabetes,
      smoker,
      doctor_email,
      care_team_email,
      hospitalisations
    ]
  );

  return result.rows[0];
}

async function findByUserId(userId) {
  const result = await pool.query(
    `SELECT * FROM clinical_profile WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0];
}

module.exports = {
  upsert,
  findByUserId
};