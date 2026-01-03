const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createMetric, listMetrics, forecastMetricRoute } = require('../controllers/healthController');
const { createBloodPressure } = require('../controllers/bloodPressureController');

const router = express.Router();

router.use(authenticateToken);

router.post('/metrics', createMetric);
router.get('/metrics', listMetrics);
router.get('/forecast', forecastMetricRoute);
router.post('/blood-pressure', createBloodPressure);

console.log('Health routes loaded');

module.exports = router;

