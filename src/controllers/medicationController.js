// src/controllers/medicationController.js

const medicationService = require("../services/medicationService");
const auditLogger = require('../utils/auditLogger');

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
    console.error("addMedication error:", err);
		
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
    console.error("getMedications error:", err);
    res.status(500).json({ error: "Failed to load medications" });
  }
};

exports.getBpMedicationContext = async (req, res) => {
  try {
    const meds = await medicationService.getBpContext(req.user.id);
    res.json(meds);
  } catch (err) {
    console.error("getBpMedicationContext error:", err);
    res.status(500).json({ error: "Failed to load BP medication context" });
  }
};

