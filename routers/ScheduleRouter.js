const express = require("express");
const router = express.Router();

// Functions
const { createNewEvent } = require("../controllers/ScheduleController");

// CREATE NEW EVENT IN THE DB (SCHEDULE & REVISIONDATES TABLE)
router.post('/createNewEvent', createNewEvent);

module.exports = router;

