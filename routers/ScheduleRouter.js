const express = require("express");
const router = express.Router();

// Functions
const {createNewExam, retrieveAllRevisionDatesByUser, deleteExistingExam, deleteSpecificRevisionDate} = require("../controllers/ScheduleController");

// CREATE NEW EVENT IN THE DB (SCHEDULE & REVISIONDATES TABLE)
router.post("/createNewExam", createNewExam);

// RETRIEVE EXAM DETAILS FROM DB
router.get("/retrieveAllRevisionDates", retrieveAllRevisionDatesByUser);

// DELETE EXAM FROM DB
router.delete("/deleteExistingExam", deleteExistingExam);

// DELETE SPECIFIC REVISION DATE
router.delete("/deleteSpecificRevisionDate", deleteSpecificRevisionDate);

module.exports = router;