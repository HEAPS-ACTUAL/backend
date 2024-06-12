const express = require("express");
const router = express.Router();
const multer = require('multer');
const { generateAndStoreQuiz } = require("../controllers/QuizController");

// Set up multer for in-memory file uploads
const storage = multer.memoryStorage(); // creates a buffer storage
const upload = multer({ storage: storage });

// GENERATE QUIZ
router.post('/generateAndStoreQuiz', upload.single('file'), generateAndStoreQuiz);

module.exports = router;