const alertModel = require('../models/alertModel');
const alertService = require('../services/alertService');
const logger = require('../utils/logger');

async function listAlerts(req, res) {
  try {
    const alerts = await alertModel.getAlertsByUser(req.user.id);
    res.json(alerts);
  } catch (err) {
	logger.error('Error fetching alerts', {
	  message: err.message,
	  stack: err.stack
	});
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function listPatientAlerts(req, res) {
  try {
    const doctorId = req.user.id;
    const patientId = req.params.patientId;

    if (!patientId) {
      return res.status(400).json({ message: "Patient ID required" });
    }

    const alerts = await alertModel.getActiveAlertsByUser(patientId);

    res.json(alerts);

  } catch (err) {
    logger.error('Error fetching patient alerts', {
      message: err.message,
      stack: err.stack
    });

    res.status(500).json({ message: 'Internal server error' });
  }
}

async function acknowledgeAlert(req, res) {
  const doctorId = req.user.id;
  const alertId = req.params.id;

  const result = await alertService.acknowledgeAlert(alertId, doctorId);
  res.json(result);
}

async function acknowledgePatientAlerts(req, res) {
  const doctorId = req.user.id;
  const patientId = req.params.patientId;

  const result = await alertService.acknowledgeAllForPatient(patientId, doctorId);

  res.json(result);
}

module.exports = { listAlerts, listPatientAlerts, acknowledgeAlert, acknowledgePatientAlerts };