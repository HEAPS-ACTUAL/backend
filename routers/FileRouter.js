/*
This file is in charge of determining which functions from FileController.js to 
execute based on the endpoint of the request that is being sent.
*/

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile } = require('../controllers/FileController');

// Set up multer for in-memory file uploads
const storage = multer.memoryStorage(); // creates a buffer storage
const upload = multer({ storage });

// UPLOAD PDF BY USER
router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;