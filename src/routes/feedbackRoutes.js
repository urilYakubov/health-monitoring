const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/feedback", authenticateToken, feedbackController.addFeedback);

module.exports = router;