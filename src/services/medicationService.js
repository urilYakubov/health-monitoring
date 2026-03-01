// src/services/medicationService.js

const medicationModel = require("../models/medicationModel");

exports.addMedication = async (data) => {
  const {
    userId,
    name,
    category,
    dose,
    frequency,
    started_at,
    ended_at,
    prescribed_by,
    notes
  } = data;

  if (!name || !started_at) {
    const err = new Error("Medication name and start date are required");
    err.statusCode = 400;
    throw err;
  }

  // 🛡️ Date validation
  if (ended_at && new Date(ended_at) < new Date(started_at)) {
    const err = new Error("Medication end date cannot be before start date");
    err.statusCode = 400;
    throw err;
  }

  // 🔍 Duplicate check
  const duplicate = await medicationModel.checkDuplicateMedication({
    userId,
    name,
    started_at,
    ended_at
  });

  if (duplicate) {
    const err = new Error("Duplicate active medication detected");
    err.statusCode = 409;
    throw err;
  }

  return medicationModel.insertMedication({
    userId,
    name,
    category,
    dose,
    frequency,
    started_at,
    ended_at,
    prescribed_by,
    notes
  });
};

exports.getMedications = async (userId) => {
  return medicationModel.getMedicationsByUser(userId);
};

exports.getBpContext = async (userId) => {
  return medicationModel.getBpAffectingMedications({ userId });
};

exports.getBpEffectiveness = async (userId) => {
  const results = await medicationModel.getBpEffectivenessStats(userId);

  if (!results || results.length === 0) {
    return [];
  }

  return results.map((med, index, arr) => {
    const previous = index > 0 ? arr[index - 1] : null;

    return {
      ...med,
      systolic_change_from_previous:
        previous
          ? Number((med.avg_systolic - previous.avg_systolic).toFixed(1))
          : null
    };
  });
};
