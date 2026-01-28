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

  // 🛡️ Safety rules
  if (ended_at && new Date(ended_at) < new Date(started_at)) {
    throw new Error("Medication end date cannot be before start date");
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



