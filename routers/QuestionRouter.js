const express = require("express");
const router = express.Router();
const { countTotalNumberOfQuestions } = require("../controllers/QuestionController");

// GET NUMEBR OF QUESTIONS
router.post('/getNumberOfQuestions', countTotalNumberOfQuestions);

module.exports = router;