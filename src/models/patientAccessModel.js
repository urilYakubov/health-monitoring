const db = require("../config/db");

async function getPatientsForDoctor(doctorId) {
  const query = `
    SELECT 
	  u.id,
	  u.email,
	  u.first_name,
	  u.last_name,
	  pc.granted_at,

	  cp.sex,
	  cp.date_of_birth,
	  cp.nyha_class,
	  cp.baseline_weight,

	  -- latest systolic BP
	  (
		SELECT systolic
		FROM blood_pressure_readings bp
		WHERE bp.user_id = u.id
		ORDER BY measured_at DESC
		LIMIT 1
	  ) as systolic,

	  -- latest HR
	  (
		SELECT value
		FROM health_data
		WHERE user_id = u.id AND metric_type = 'heart_rate'
		ORDER BY recorded_at DESC
		LIMIT 1
	  ) as heart_rate,
	  
	  -- weight
	  (
	  SELECT value
	  FROM health_data
	  WHERE user_id = u.id AND metric_type = 'weight'
	  ORDER BY recorded_at DESC
	  LIMIT 1
	  ) as current_weight,

	  -- alerts count
	  (
		SELECT COUNT(*)
		FROM alerts a
		WHERE a.user_id = u.id 
		AND a.created_at > NOW() - INTERVAL '7 days'
		AND a.acknowledged_at IS NULL
	  ) as alerts_count

	FROM patient_consents pc
	JOIN users u ON u.id = pc.patient_id
	LEFT JOIN clinical_profile cp ON cp.user_id = u.id

	WHERE pc.doctor_id = $1
	  AND pc.revoked_at IS NULL
  `;

  const { rows } = await db.query(query, [doctorId]);
  return rows;
}

module.exports = {
  getPatientsForDoctor
};