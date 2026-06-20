const express = require("express");
const router = express.Router();

const { authenticateToken } =
  require("../middleware/authMiddleware");

const authorizeRole =
  require("../middleware/roleMiddleware");

const adminController =
  require("../controllers/adminController");

router.get(
  "/admin/users",
  authenticateToken,
  authorizeRole("admin"),
  adminController.getUsers
);

router.patch(
  "/admin/users/:id/role",
  authenticateToken,
  authorizeRole("admin"),
  adminController.changeRole
);

module.exports = router;