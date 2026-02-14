// src/controllers/symptomController.js

const symptomModel = require('../models/symptomModel');
const { logAudit } = require('../utils/auditLogger');

// CREATE symptom
exports.createSymptom = async (req, res) => {
  const { symptom, severity, notes } = req.body;
  const userId = req.user.id;
  
  try {
    const newSymptom = await symptomModel.saveSymptom({
      user_id: userId,
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

    res.json(newSymptom);
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
	
    res.status(500).json({ message: 'Server error' });
  }
};

// GET all symptoms for a user
exports.getSymptoms = async (req, res) => {
  try {
    const userId = req.user.id;

    const symptoms = await symptomModel.getUserSymptoms(userId);

    res.json(symptoms);
  } catch (err) {
    console.error('getSymptoms error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
