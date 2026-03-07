const patientAccessService = require("../services/patientAccessService");
const logger = require("../utils/logger");

async function getMyPatients(req, res) {

  const doctorId = req.user.id;

  if (!doctorId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {

    const patients = await patientAccessService.fetchPatientsForDoctor(doctorId);

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

module.exports = {
  getMyPatients
};