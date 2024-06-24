const express = require("express");
const router = express.Router();

// Functions
const { markQuizAsDone } = require("../controllers/QuizController");

// MARK QUIZ AS DONE
router.post('/markQuizAsDone', markQuizAsDone);

module.exports = router;