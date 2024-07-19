const express = require("express");
const router = express.Router();

// functions
const { getAllFlashcardsWithoutSchedule, getFlashcardsByScheduleID } = require("../controllers/FlashcardController");

// GET ALL FLASHCARDS WITHOUT A SCHEDULE
router.get('/getAllFlashcardsWithoutSchedule', getAllFlashcardsWithoutSchedule);

// GET FLASHCARDS BY SCHEDULE ID
router.get('/getFlashcardsByScheduleID', getFlashcardsByScheduleID);

module.exports = router;