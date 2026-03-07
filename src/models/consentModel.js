const db = require("../config/db");

async function getDoctorsForPatient(patientId) {
  const query = `
    SELECT u.id, u.email, pc.granted_at
    FROM patient_consents pc
    JOIN users u ON u.id = pc.doctor_id
    WHERE pc.patient_id = $1
      AND pc.revoked_at IS NULL
      AND u.role = 'doctor'
    ORDER BY pc.granted_at DESC
  `;

  const { rows } = await db.query(query, [patientId]);
  return rows;
}

async function addDoctorPatient(patientId, doctorId) {

  const query = `
    INSERT INTO doctor_patients (doctor_id, patient_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING *
  `;

  const { rows } = await db.query(query, [doctorId, patientId]);
  return rows[0];
}

async function removeDoctorPatient(patientId, doctorId) {

  const query = `
    DELETE FROM doctor_patients
    WHERE doctor_id = $1 AND patient_id = $2
    RETURNING *
  `;

  const { rows } = await db.query(query, [doctorId, patientId]);
  return rows[0];
}

async function grantConsent(patientId, doctorId, accessLevel) {

  const query = `
    INSERT INTO patient_consents (patient_id, doctor_id, access_level)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const { rows } = await db.query(query, [patientId, doctorId, accessLevel]);
  return rows[0];
}

async function revokeConsent(patientId, doctorId) {

  const query = `
    UPDATE patient_consents
    SET revoked_at = NOW()
    WHERE patient_id = $1
      AND doctor_id = $2
      AND revoked_at IS NULL
    RETURNING *
  `;

  const { rows } = await db.query(query, [patientId, doctorId]);
  return rows[0];
}

async function findDoctorByEmail(email) {

  const query = `
    SELECT id
    FROM users
    WHERE email = $1
      AND role = 'doctor'
  `;

  const { rows } = await db.query(query, [email]);

  return rows[0];
}

module.exports = {
  getDoctorsForPatient,
  addDoctorPatient,
  removeDoctorPatient,
  grantConsent,
  revokeConsent,
  findDoctorByEmail
};