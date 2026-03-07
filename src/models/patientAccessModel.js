const db = require("../config/db");

async function getPatientsForDoctor(doctorId) {

  const query = `
    SELECT u.id, u.email, pc.granted_at
    FROM patient_consents pc
    JOIN users u ON u.id = pc.patient_id
    WHERE pc.doctor_id = $1
      AND pc.revoked_at IS NULL
      AND u.role = 'patient'
    ORDER BY pc.granted_at DESC
  `;

  const { rows } = await db.query(query, [doctorId]);
  return rows;
}

module.exports = {
  getPatientsForDoctor
};