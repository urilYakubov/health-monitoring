const express = require("express");
const router = express.Router();
const preferencesController = require("../controllers/preferencesController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, preferencesController.getPreferences);
router.post("/", authenticateToken, preferencesController.savePreferences);

module.exports = router;