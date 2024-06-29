const express = require("express");
const router = express.Router();

// Functions
const { createNewExam } = require("../controllers/ScheduleController");

// CREATE NEW EVENT IN THE DB (SCHEDULE & REVISIONDATES TABLE)
router.post('/createNewExam', createNewExam);

// RETRIEVE EXAM DETAILS FROM DB (not sure if correct)
// router.post('GetExamDetailsForCalendar', GetExamDetailsForCalendar)

module.exports = router;

