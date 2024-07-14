const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  authenticate,
  getUserByEmail,
  createNewUser,
  updateUser,
  deleteUser,
} = require("../controllers/UserController");

// GET ALL USERS
router.get("/", getAllUsers);

// GET USER BY EMAIL
router.post("/profile", getUserByEmail);

// AUTHENTICATE
router.post("/authenticate", authenticate);

// REGISTER
router.post("/register", createNewUser);

// Update user
router.put("/update", updateUser);

// Delete user
router.delete("/delete", deleteUser);

module.exports = router;
