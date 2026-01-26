// src/routes/medicationRoutes.js

const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medicationController");
const { authenticateToken } = require('../middleware/authMiddleware');

router.post("/", authenticateToken, medicationController.addMedication);
router.get("/", medicationController.getMedications);

module.exports = router;
