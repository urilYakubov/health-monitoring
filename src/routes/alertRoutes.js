const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const authorizeRole = require("../middleware/roleMiddleware");
const alertController = require('../controllers/alertController');

const router = express.Router();

router.get('/alerts', authenticateToken, alertController.listAlerts);

router.patch(
  "/alerts/:id/acknowledge",
  authenticateToken,
  authorizeRole("doctor"),
  alertController.acknowledgeAlert
);

router.patch(
  "/patients/:patientId/acknowledge-alerts",
  authenticateToken,
  authorizeRole("doctor"),
  alertController.acknowledgePatientAlerts
);

router.get(
  "/patients/:patientId/alerts",
  authenticateToken,
  authorizeRole("doctor"),
  alertController.listPatientAlerts
);

module.exports = router;