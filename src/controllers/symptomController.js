// src/controllers/symptomController.js

const symptomService = require('../services/symptomService');
const { logAudit } = require('../utils/auditLogger');
const logger = require('../utils/logger');

// CREATE symptom
exports.createSymptom = async (req, res) => {
  const { symptom, severity, notes } = req.body;
  const userId = req.user.id;

  try {
    const newSymptom = await symptomService.createSymptom({
      userId,
      symptom,
      severity,
      notes
    });

    await logAudit({
      userId,
      action: 'CREATE_SYMPTOM',
      entity: 'user_symptoms',
      entityId: newSymptom?.id ?? null,
      details: {
        symptom,
        severity,
        notes: notes ?? null
      }
    });

    res.status(201).json(newSymptom);

  } catch (err) {
	logger.error('createSymptom error', {
	  message: err.message,
	  stack: err.stack,
	  userId,
	  symptom,
	  severity
	});

    await logAudit({
      userId,
      action: 'CREATE_SYMPTOM_FAILED',
      entity: 'user_symptoms',
      details: {
        symptom,
        error: err.message
      }
    });

    const status = err.statusCode || 500;

    res.status(status).json({
      message: err.message || 'Server error'
    });
  }
};

// GET all symptoms
exports.getSymptoms = async (req, res) => {
	const userId = req.user.id;
  try {
    const symptoms = await symptomService.getSymptoms(userId);
    res.json(symptoms);
  } catch (err) {
	logger.error('getSymptoms error', {
	  message: err.message,
	  stack: err.stack,
	  userId
	});
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSymptomsForPatient = async (req, res) => {

  const doctorId = req.user.id;
  const patientId = req.params.patientId;

  try {

    const symptoms = await symptomService.getSymptoms(patientId);

    res.json(symptoms);

  } catch (err) {

    logger.error('getSymptomsForPatient error', {
      doctorId,
      patientId,
      message: err.message,
      stack: err.stack
    });

    res.status(500).json({ message: 'Server error' });

  }

};
