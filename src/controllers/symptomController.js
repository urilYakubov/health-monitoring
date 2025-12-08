// src/controllers/symptomController.js

const symptomModel = require('../models/symptomModel');

// CREATE symptom
exports.createSymptom = async (req, res) => {
  try {
    const { symptom, severity, notes } = req.body;
    const userId = req.user.id;

    const newSymptom = await symptomModel.saveSymptom({
      user_id: userId,
      symptom,
      severity,
      notes
    });

    res.json(newSymptom);
  } catch (err) {
    console.error('createSymptom error:', err);
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
