/*
This file is in charge of determining which functions from UserController.js to execute based on the endpoint of the request that is being sent.
*/

const express = require('express');
const router = express.Router();
const { getAllUsers, authenticate, getUserByEmail, createNewUser, uploadFile } = require('../controllers/UserController');
const multer = require('multer');
// Set up multer for in-memory file uploads
const storage = multer.memoryStorage(); // creates a buffer storage
const upload = multer({ storage });

// GET ALL USERS
router.get('/', getAllUsers);

// GET USER BY EMAIL
router.get('/profile', getUserByEmail);

// AUTHENTICATE
router.post('/authenticate', authenticate);

// RESGISTER
router.post('/register', createNewUser);

// UPLOAD PDF BY USER
router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;