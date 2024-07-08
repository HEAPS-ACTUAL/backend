const express = require("express");
const router = express.Router();

// Functions
const {
  createNewExam,
  retrieveAllRevisionDatesByUser,
  DeleteExistingExam,
  DeleteSpecificRevisionDate,
  fetchTestsByScheduleIdAndDate,
} = require("../controllers/ScheduleController");

// CREATE NEW EVENT IN THE DB (SCHEDULE & REVISIONDATES TABLE)
router.post("/createNewExam", createNewExam);

// RETRIEVE EXAM DETAILS FROM DB
router.post("/retrieveAllRevisionDates", retrieveAllRevisionDatesByUser);

// DELETE EXAM FROM DB
router.post("/DeleteExistingExam", DeleteExistingExam);

// DELETE SPECIFIC REVISION DATE
router.post("/DeleteSpecificRevisionDate", DeleteSpecificRevisionDate);

// FETCH FLASHCARDS BY SCHEDULE ID AND DATE
router.get("/fetchTestsByScheduleIdAndDate/:scheduleId/:date", (req, res) => {
  console.log("Route hit: fetchTestsByScheduleIdAndDate");
  fetchTestsByScheduleIdAndDate(req, res);
});

module.exports = router;
