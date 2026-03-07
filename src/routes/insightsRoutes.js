const express = require("express");
const router = express.Router();
const insightsController = require("../controllers/insightsController");
const { authenticateToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

router.get("/insights", authenticateToken, insightsController.getInsights);
router.get(
  "/patients/:patientId/insights",
  authenticateToken,
  authorizeRole("doctor"),
  insightsController.getPatientInsights
);


module.exports = router;
