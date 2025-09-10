const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createMetric, listMetrics, forecastMetricRoute } = require('../controllers/healthController');

const router = express.Router();

router.use(authenticateToken);

router.post('/metrics', createMetric);
router.get('/metrics', listMetrics);
router.get('/forecast', forecastMetricRoute);

console.log('Health routes loaded');

module.exports = router;

