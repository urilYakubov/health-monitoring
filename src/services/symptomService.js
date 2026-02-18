const symptomModel = require('../models/symptomModel');

const DUPLICATE_WINDOW_MINUTES = 30;

exports.createSymptom = async ({
  userId,
  symptom,
  severity,
  notes
}) => {

  if (!symptom) {
    const err = new Error("Symptom is required");
    err.statusCode = 400;
    throw err;
  }

  // 🔍 Duplicate check
  const isDuplicate = await symptomModel.checkDuplicateSymptom({
    userId,
    symptom,
    windowMinutes: DUPLICATE_WINDOW_MINUTES
  });

  if (isDuplicate) {
    const err = new Error("Duplicate symptom detected");
    err.statusCode = 409;
    throw err;
  }

  return symptomModel.saveSymptom({
    user_id: userId,
    symptom,
    severity,
    notes
  });
};

exports.getSymptoms = async (userId) => {
  return symptomModel.getUserSymptoms(userId);
};
