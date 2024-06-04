/*
This file is in charge of determining which functions from FileController.js to 
execute based on the endpoint of the request that is being sent.
*/

const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/FileController');
const multer = require('multer');


// UPLOAD PDF BY USER
router.post('/upload', upload.single('file'), uploadFile);

module.exports = router;