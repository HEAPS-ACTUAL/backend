const express = require("express");
const router = express.Router();
const { countTotalNumberOfQuestions, getAllQuestionsAndOptionsFromAQuiz } = require("../controllers/QuestionController");

// GET NUMEBR OF QUESTIONS
router.post('/getNumberOfQuestions', countTotalNumberOfQuestions);

// GET QUESTIONS AND OPTIONS FOR A QUIZ
router.post('/getQuestionsAndOptions', getAllQuestionsAndOptionsFromAQuiz);

module.exports = router;