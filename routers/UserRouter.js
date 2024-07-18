/*
This file is in charge of determining which functions from UserController.js to 
execute based on the endpoint of the request that is being sent.
*/

const express = require("express");
const router = express.Router();
const { getAllUsers, authenticate, getUserByEmail, createNewUser, checkUserIsVerified, deleteUser, updateUser } = require("../controllers/UserController");

// GET ALL USERS
router.get("/", getAllUsers);

// GET USER BY EMAIL
router.post("/profile", getUserByEmail);

// AUTHENTICATE
router.post("/authenticate", authenticate);

// REGISTER
router.post("/register", createNewUser);

// VERIFIED
router.post("/is-verified", checkUserIsVerified);

// DELETE USER
router.delete("/delete", deleteUser);

// UPDATE USER
router.put("/update", updateUser);

module.exports = router;
