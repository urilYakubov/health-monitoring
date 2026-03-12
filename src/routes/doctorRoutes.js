const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { authenticateToken } = require("../middleware/authMiddleware");
const authorizeRole = require("../middleware/roleMiddleware");

router.get("/my-patients", authenticateToken, authorizeRole("doctor"), doctorController.getMyPatients);
router.get(
  "/patients/:patientId/metrics",
  authenticateToken,
  authorizeRole("doctor"),
  doctorController.getPatientMetrics
);

module.exports = router;