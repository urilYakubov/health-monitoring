// src/routes/medications.js

const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medicationController");
const auth = require("../middleware/auth");

router.post("/", auth, medicationController.addMedication);

module.exports = router;
