const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/my-patients", authenticateToken, doctorController.getMyPatients);

module.exports = router;