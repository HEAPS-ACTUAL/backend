const express = require("express");
const router = express.Router();
const { countTotalNumberOfFlashcardQuestions } = require("../controllers/FlashcardQuestionController");

// GET NUMEBR OF QUESTIONS
router.post('/getNumberOfFlashcardQuestions', countTotalNumberOfFlashcardQuestions);

module.exports = router;