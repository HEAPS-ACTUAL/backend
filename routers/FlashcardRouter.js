const express = require("express");
const router = express.Router();

// functions
const { getAllFlashcardsWithoutSchedule, getFlashcardsByScheduleID } = require("../controllers/FlashcardController");

// GET ALL FLASHCARDS WITHOUT A SCHEDULE
router.post('/getAllFlashcardsWithoutSchedule', getAllFlashcardsWithoutSchedule);

// GET FLASHCARDS BY SCHEDULE ID
router.post('/getFlashcardsByScheduleID', getFlashcardsByScheduleID);

module.exports = router;