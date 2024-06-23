const express = require("express");
const router = express.Router();

// Functions
const { markQuizAsDone, storeUserQuizAnswers } = require("../controllers/QuizController");

// MARK QUIZ AS DONE
router.post('/markQuizAsDone', markQuizAsDone);

// STORE USER'S QUIZ ANSWERS
router.post('/storeUserQuizAnswers', storeUserQuizAnswers);

module.exports = router;