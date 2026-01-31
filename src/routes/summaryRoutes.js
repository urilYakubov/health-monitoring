const express = require("express");
const router = express.Router();
const summaryController = require("../controllers/summaryController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, summaryController.getVitalsSummary);

module.exports = router;
