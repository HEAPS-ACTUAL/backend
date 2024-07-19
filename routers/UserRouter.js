/*
This file is in charge of determining which functions from UserController.js to 
execute based on the endpoint of the request that is being sent.
*/

const express = require("express");
const router = express.Router();
const { authenticate, getUserByEmail, createNewUser, deleteUser, updateUser } = require("../controllers/UserController");

// GET USER BY EMAIL
router.get("/profile", getUserByEmail);

// AUTHENTICATE
router.post("/authenticate", authenticate);

// REGISTER
router.post("/register", createNewUser);

// DELETE USER
router.delete("/delete", deleteUser);

// UPDATE USER
router.post("/update", updateUser);

module.exports = router;
