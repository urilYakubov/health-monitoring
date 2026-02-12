const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createMetric, listMetrics, forecastMetricRoute } = require('../controllers/healthController');
const { createBloodPressure } = require('../controllers/bloodPressureController');
const validateMetric = require('../middleware/validateMetric');
const validateBloodPressure = require('../middleware/validateBloodPressure');

const router = express.Router();

router.use(authenticateToken);

router.post(
  '/metrics',
  validateMetric,   // runs BEFORE controller
  createMetric
);

router.get('/metrics', listMetrics);
router.get('/forecast', forecastMetricRoute);
router.post(
  '/blood-pressure',
  validateBloodPressure,
  createBloodPressure
);

console.log('Health routes loaded');

module.exports = router;

