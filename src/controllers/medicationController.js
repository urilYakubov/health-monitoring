// src/controllers/medicationController.js

const medicationService = require("../services/medicationService");

exports.addMedication = async (req, res) => {
  try {
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

    res.status(201).json(medication);
  } catch (err) {
    console.error("addMedication error:", err);
    res.status(500).json({ error: "Failed to add medication" });
  }
};
