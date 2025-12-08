// src/routes/symptomRoutes.js
const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { authenticateToken } = require('../middleware/authMiddleware');

// CREATE symptom
router.post('/', authenticateToken, symptomController.createSymptom);

// GET all symptoms for logged-in user
router.get('/', authenticateToken, symptomController.getSymptoms);

module.exports = router;