// src/routes/medicationRoutes.js

const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medicationController");
const { authenticateToken } = require('../middleware/authMiddleware');

router.post("/", authenticateToken, medicationController.addMedication);
router.get("/", medicationController.getMedications);
router.get("/bp-context", authenticateToken, medicationController.getBpMedicationContext);
router.get("/bp-effectiveness", authenticateToken, medicationController.getBpEffectiveness);
router.get(
  "/patient/:patientId/bp-context",
  authenticateToken,
  medicationController.getBpMedicationContextForPatient
);
router.get(
  "/patient/:patientId/bp-effectiveness",
  authenticateToken,
  medicationController.getBpEffectivenessForPatient
);
router.get(
  "/patient/:patientId",
  authenticateToken,
  medicationController.getMedicationsForPatient
);


module.exports = router;
