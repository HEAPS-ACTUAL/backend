const express = require("express");
const router = express.Router();
const multer = require('multer');
const { generateAndStoreTest, deleteTest, getTestInfo, getAllQuestionsAndOptionsFromATest } = require("../controllers/TestController");

// Set up multer for in-memory file uploads
const storage = multer.memoryStorage(); // creates a buffer storage
const upload = multer({ storage: storage });

// GENERATE TEST AND STORE IT
router.post('/generateAndStoreTest', upload.single('file'), generateAndStoreTest);

// DELETING A TEST
router.delete('/deleteTest', deleteTest);

// RETRIEVING TEST INFO
router.post('/getTestInfo', getTestInfo);

// GET QUESTIONS AND OPTIONS FOR A TEST
router.get('/getQuestionsAndOptions', getAllQuestionsAndOptionsFromATest);

module.exports = router;