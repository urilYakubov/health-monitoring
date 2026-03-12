// src/controllers/medicationController.js

const medicationService = require("../services/medicationService");
const auditLogger = require('../utils/auditLogger');
const logger = require('../utils/logger');

exports.addMedication = async (req, res) => {
  const userId = req.user.id;
  
  const {
      name,
      category,
      dose,
      frequency,
      started_at,
      ended_at,
      prescribed_by,
      notes
    } = req.body;
  
  try {
    if (!name || !started_at) {
      return res.status(400).json({
        error: "Medication name and start date are required"
      });
    }

    const medication = await medicationService.addMedication({
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
	
	await auditLogger.logAudit({
      userId,
      action: 'ADD_MEDICATION',
      entity: 'user_medications',
      entityId: medication?.id ?? null,
      details: {
        name,
        category: category ?? null,
        dose: dose ?? null,
        frequency: frequency ?? null,
		started_at: started_at ?? null,
		ended_at: ended_at ?? null,
		prescribed_by: prescribed_by ?? null,
		notes: notes ?? null
      }
    });

    res.status(201).json(medication);
  } catch (err) {
	logger.error('addMedication error', {
	  message: err.message,
	  stack: err.stack,
	  userId,
	  name,
	  started_at
	});
		
	await auditLogger.logAudit({
      userId,
      action: 'ADD_MEDICATION_FAILED',
      entity: 'user_medications',
      details: {
        name: name ?? null,
        error: err.message
      }
    });
	
    res.status(500).json({ error: "Failed to add medication" });
  }
};

exports.getMedications = async (req, res) => {
  try {
    const meds = await medicationService.getMedications(req.user.id);
    res.json(meds);
  } catch (err) {
	logger.error('getMedications error', {
	  message: err.message,
	  stack: err.stack
	});
    res.status(500).json({ error: "Failed to load medications" });
  }
};

exports.getBpMedicationContext = async (req, res) => {
  try {
    const meds = await medicationService.getBpContext(req.user.id);
    res.json(meds);
  } catch (err) {
	logger.error('getBpMedicationContext error', {
	  message: err.message,
	  stack: err.stack
	});
    res.status(500).json({ error: "Failed to load BP medication context" });
  }
};


exports.getBpEffectiveness = async (req, res) => {
  try {
    const data =
      await medicationService.getBpEffectiveness(
        req.user.id
      );

    res.json(data);
  } catch (err) {
	logger.error('getBpEffectiveness error', {
	  message: err.message,
	  stack: err.stack
	});
    res.status(500).json({
      error: "Failed to calculate medication effectiveness"
    });
  }
};

exports.getBpMedicationContextForPatient = async (req, res) => {

  const doctorId = req.user.id;
  const patientId = req.params.patientId;
  

  try {

    const meds = await medicationService.getBpContext(patientId);

    res.json(meds);

  } catch (err) {

    logger.error("getBpMedicationContextForPatient error", {
      doctorId,
      patientId,
      message: err.message,
      stack: err.stack
    });

    res.status(500).json({
      error: "Failed to load BP medication context"
    });

  }

};

exports.getBpEffectivenessForPatient = async (req, res) => {
  
  const doctorId = req.user.id;
  const patientId = req.params.patientId;
  
  try {
    const data =
      await medicationService.getBpEffectiveness(
        patientId
      );

    res.json(data);
  } catch (err) {
	logger.error('getBpEffectivenessForPatient error', {
	  message: err.message,
	  stack: err.stack,
	  doctorId,
	  patientId
	});
    res.status(500).json({
      error: "Failed to calculate medication effectiveness for patient"
    });
  }
};

exports.getMedicationsForPatient = async (req, res) => {
	
  const doctorId = req.user.id;
  const patientId = req.params.patientId;
	
  try {
    const meds = await medicationService.getMedications(patientId);
    res.json(meds);
  } catch (err) {
	logger.error('getMedicationsForPatient error', {
	  message: err.message,
	  stack: err.stack,
	  doctorId,
	  patientId
	});
    res.status(500).json({ error: "Failed to load medications" });
  }
};

