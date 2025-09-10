const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data', userId: req.user.id });
});

module.exports = router;
