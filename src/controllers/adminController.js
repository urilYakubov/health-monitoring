const userModel = require("../models/userModel");

async function getUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch users"
    });
  }
}

async function changeRole(req, res) {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const user = await userModel.updateUserRole(
      userId,
      role
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({
      message: "Failed to update role"
    });
  }
}

module.exports = {
  getUsers,
  changeRole
};
