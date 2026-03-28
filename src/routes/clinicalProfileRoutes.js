const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateClinicalProfile');
const controller = require('../controllers/clinicalProfileController');

router.post('/', authenticateToken, validate, controller.saveProfile);
router.get('/', authenticateToken, controller.getProfile);

module.exports = router;