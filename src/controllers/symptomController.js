// src/controllers/symptomController.js

const symptomService = require('../services/symptomService');
const { logAudit } = require('../utils/auditLogger');

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
    console.error('createSymptom error:', err);

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
  try {
    const userId = req.user.id;
    const symptoms = await symptomService.getSymptoms(userId);
    res.json(symptoms);
  } catch (err) {
    console.error('getSymptoms error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
