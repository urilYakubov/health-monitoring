const { getMetricsByUser } = require('../models/healthModel');
const patientAccessService = require("../services/patientAccessService");
const logger = require("../utils/logger");

async function getMyPatients(req, res) {

  const doctorId = req.user.id;

  if (!doctorId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const patients = await patientAccessService.getPatientsWithRisk(doctorId);
    res.json(patients);
  } catch (err) {
	logger.error("Get patients error", {
      message: err.message,
      stack: err.stack,
      doctorId
    });
    res.status(500).json({ message: "Failed to fetch patients" });
  }

}

async function getPatientMetrics(req, res) {

  const doctorId = req.user.id;
  const patientId = req.params.patientId;

  if (!doctorId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const metrics = await getMetricsByUser(patientId);
    res.json(metrics);
  } catch (err) {

    logger.error("Get patient metrics error", {
      message: err.message,
      stack: err.stack,
      doctorId,
      patientId
    });

    res.status(500).json({ message: "Failed to fetch metrics" });

  }
}

module.exports = {
  getMyPatients,
  getPatientMetrics
};