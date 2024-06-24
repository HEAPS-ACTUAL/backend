const express = require("express");
const router = express.Router();

// Functions
const { markQuizAsDone, storeUserQuizAnswers, reviewQuiz } = require("../controllers/QuizController");

// MARK QUIZ AS DONE
router.post('/markQuizAsDone', markQuizAsDone);

// STORE USER'S QUIZ ANSWERS
router.post('/storeUserQuizAnswers', storeUserQuizAnswers);

// REVIEW QUIZ
router.post('/reviewQuiz', reviewQuiz);

module.exports = router;