const express = require("express");
const router = express.Router();

// Functions
const { setupNewEvent } = require("../controllers/ScheduleController");

router.post('createNewEvent', createNewEvent);

module.exports = router;

