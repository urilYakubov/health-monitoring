const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { listAlerts } = require('../controllers/alertController');

const router = express.Router();

router.use(authenticateToken);
router.get('/alerts', listAlerts);

module.exports = router;