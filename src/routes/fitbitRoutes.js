// routes/fitbitRoutes.js
const express = require("express");
const router = express.Router();
const fitbitController = require("../controllers/fitbitController");

// Step 1: Connect Fitbit
router.get("/connect-fitbit", fitbitController.connectFitbit);

// Step 2: Fitbit callback
router.get("/callback", fitbitController.handleCallback);

module.exports = router;