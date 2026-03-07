const consentModel = require("../models/consentModel");

async function fetchDoctorsForPatient(patientId) {
  if (!patientId) {
    throw new Error("Invalid patient ID");
  }

  return await consentModel.getDoctorsForPatient(patientId);
}

async function shareWithDoctor(patientId, doctorEmail, accessLevel = "read_only") {
	
  const doctor = await consentModel.findDoctorByEmail(doctorEmail);

  if (!doctor) {
    throw new Error("Doctor not found");
  }
  
  const doctorId = doctor.id;

  await consentModel.addDoctorPatient(patientId, doctorId);

  const consent = await consentModel.grantConsent(
    patientId,
    doctorId,
    accessLevel
  );

  return consent;
}

async function revokeDoctor(patientId, doctorId) {

  await consentModel.removeDoctorPatient(patientId, doctorId);

  const revoked = await consentModel.revokeConsent(
    patientId,
    doctorId
  );

  return revoked;
}

module.exports = {
  fetchDoctorsForPatient,
  shareWithDoctor,
  revokeDoctor
};