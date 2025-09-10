// routes/withingsRoutes.js
const express = require("express");
const router = express.Router();
const withingsController = require("../controllers/withingsController");

// Step 1: Connect Withings
router.get("/connect-withings", withingsController.connectWithings);

// Step 2: Callback
router.get("/withings/callback", withingsController.handleCallback);

module.exports = router;