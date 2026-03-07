const express = require("express");
const router = express.Router();
const consentController = require("../controllers/consentController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Only patients can call this
router.get(
  "/my-doctors",
  authenticateToken,
  consentController.getMyDoctors
);

router.post(
  "/share-with-doctor",
  authenticateToken,
  consentController.shareWithDoctor
);

router.delete(
  "/revoke-doctor/:doctorId",
  authenticateToken,
  consentController.revokeDoctor
);

module.exports = router;