const express = require("express");
const router = express.Router();

// functions
const { getAllFlashcardsWithoutSchedule, getFlashcardsByScheduleID, updateFlashcard } = require("../controllers/FlashcardController");

// GET ALL FLASHCARDS WITHOUT A SCHEDULE
router.get('/getAllFlashcardsWithoutSchedule', getAllFlashcardsWithoutSchedule);

// GET FLASHCARDS BY SCHEDULE ID
router.get('/getFlashcardsByScheduleID', getFlashcardsByScheduleID);

// UPDATE FLASHCARD TEXT BY SCHEDULE ID
router.post('/updateFlashcard', updateFlashcard);

module.exports = router;