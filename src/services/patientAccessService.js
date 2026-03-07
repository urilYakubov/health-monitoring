const patientAccessModel = require("../models/patientAccessModel");

async function fetchPatientsForDoctor(doctorId) {

  if (!doctorId) {
    throw new Error("Invalid doctor id");
  }

  return await patientAccessModel.getPatientsForDoctor(doctorId);
}

module.exports = {
  fetchPatientsForDoctor
};