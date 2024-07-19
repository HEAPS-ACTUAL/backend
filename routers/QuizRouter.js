const express = require("express");
const router = express.Router();

// Functions
const { markQuizAsDone, storeUserQuizAnswers, reviewQuiz, getLatestAttempt } = require("../controllers/QuizController");

// MARK QUIZ AS DONE
router.post('/markQuizAsDone', markQuizAsDone);

// STORE USER'S QUIZ ANSWERS
router.post('/storeUserQuizAnswers', storeUserQuizAnswers);

// REVIEW QUIZ
router.get('/reviewQuiz', reviewQuiz);

// GET LATEST QUIZ ATTEMPT
router.get('/getLatestAttempt', getLatestAttempt);

module.exports = router;