const express = require("express");
const router = express.Router();
const multer = require('multer');
const { generateAndStoreTest } = require("../controllers/TestController");

// Set up multer for in-memory file uploads
const storage = multer.memoryStorage(); // creates a buffer storage
const upload = multer({ storage: storage });

// GENERATE FLASHCARD
router.post('/generateAndStoreTest', upload.single('file'), generateAndStoreTest);

module.exports = router;