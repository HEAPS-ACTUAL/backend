const express = require("express");
const router = express.Router();

// functions
const { getAllFlashcardsWithoutSchedule } = require("../controllers/FlashcardController");

// GET ALL FLASHCARDS WITHOUT A SCHEDULE
router.post('/getAllFlashcardsWithoutSchedule', getAllFlashcardsWithoutSchedule);