const express = require("express");
const router = express.Router();
const multer = require('multer');
const { generateAndStoreFlashcard } = require("../controllers/FlashcardController");

// Set up multer for in-memory file uploads
const storage = multer.memoryStorage(); // creates a buffer storage
const upload = multer({ storage: storage });

// GENERATE FLASHCARD
router.post('/generateAndStoreFlashcard', upload.single('file'), generateAndStoreFlashcard);

module.exports = router;