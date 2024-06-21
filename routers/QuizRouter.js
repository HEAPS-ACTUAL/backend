const express = require("express");
const router = express.Router();
const multer = require('multer');
// const { getToDoQuizzes, getCompletedQuizzes } = require("../controllers/QuizController");

// Set up multer for in-memory file uploads
const storage = multer.memoryStorage(); // creates a buffer storage
const upload = multer({ storage: storage });

// GET ALL UNDONE QUIZZES
// router.post('/getToDoQuizzes', getToDoQuizzes);

// GET ALL COMPLETED QUIZZES
// router.post('/getCompletedQuizzes', getCompletedQuizzes);


module.exports = router;