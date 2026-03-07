const consentService = require("../services/consentService");
const logger = require('../utils/logger');

async function getMyDoctors(req, res) {
  const patientId = req.user.id;
  if (!patientId) {
	return res.status(401).json({ message: "Unauthorized" });
  }
	
  try {
    const doctors = await consentService.fetchDoctorsForPatient(patientId);
    res.json(doctors);
  } catch (err) {
	logger.error('Get doctors error', {
	  message: err.message,
	  stack: err.stack,
	  patientId
	});
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
}

async function shareWithDoctor(req, res) {
	
  const patientId = req.user.id;
  const { doctorEmail, accessLevel } = req.body;

  try {

    const result = await consentService.shareWithDoctor(
      patientId,
      doctorEmail,
      accessLevel
    );

    res.status(201).json({
      message: "Doctor access granted",
      consent: result
    });

  } catch (err) {

    logger.error("Share doctor error", {
      message: err.message,
      stack: err.stack,
	  patientId,
	  doctorEmail
    });

    res.status(500).json({ message: "Failed to share with doctor" });
  }
}

async function revokeDoctor(req, res) {
	
  const patientId = req.user.id;
  const doctorId = req.params.doctorId;

  try {

    const result = await consentService.revokeDoctor(
      patientId,
      doctorId
    );

    res.json({
      message: "Doctor access revoked",
      consent: result
    });

  } catch (err) {

    logger.error("Revoke doctor error", {
      message: err.message,
      stack: err.stack,
	  patientId,
	  doctorId
    });

    res.status(500).json({ message: "Failed to revoke doctor access" });
  }
}

module.exports = {
  getMyDoctors,
  shareWithDoctor,
  revokeDoctor
};