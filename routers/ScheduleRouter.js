const express = require("express");
const router = express.Router();

// Functions
const {createNewExam, retrieveAllRevisionDatesByUser, deleteExistingExam, deleteSpecificRevisionDate} = require("../controllers/ScheduleController");

// CREATE NEW EVENT IN THE DB (SCHEDULE & REVISIONDATES TABLE)
router.post("/createNewExam", createNewExam);

// RETRIEVE EXAM DETAILS FROM DB
router.post("/retrieveAllRevisionDates", retrieveAllRevisionDatesByUser);

// DELETE EXAM FROM DB
router.post("/deleteExistingExam", deleteExistingExam);

// DELETE SPECIFIC REVISION DATE
router.post("/deleteSpecificRevisionDate", deleteSpecificRevisionDate);

module.exports = router;