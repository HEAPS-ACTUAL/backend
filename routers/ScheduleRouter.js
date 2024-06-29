const express = require("express");
const router = express.Router();

// Functions
const { createNewExam } = require("../controllers/ScheduleController");

// CREATE NEW EVENT IN THE DB (SCHEDULE & REVISIONDATES TABLE)
router.post('/createNewExam', createNewExam);



module.exports = router;

