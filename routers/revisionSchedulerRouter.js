const express = require("express");
const router = express.Router();
const db = require("../models/ConnectionManager"); // Import the database connection

router.post("/schedules", (req, res) => {
  const { startDate, endDate, examName } = req.body;
  console.log("Received schedule data:", req.body); // Log the received data
  const query =
    "INSERT INTO Schedule (StartDate, EndDate, ExamName) VALUES (?, ?, ?)";
  db.query(query, [startDate, endDate, examName], (err, results) => {
    if (err) {
      console.error("Error inserting schedule:", err);
      res.status(500).send("Error inserting schedule");
    } else {
      res.send({ scheduleId: results.insertId });
    }
  });
});

router.post("/revision-dates", (req, res) => {
  const { scheduleId, revisionDates } = req.body;
  const query = "INSERT INTO RevisionDates (ScheduleID, RevisionDate) VALUES ?";
  const values = revisionDates.map((date) => [scheduleId, date]);
  db.query(query, [values], (err) => {
    if (err) {
      console.error("Error inserting revision dates:", err);
      res.status(500).send("Error inserting revision dates");
    } else {
      res.send("Revision dates inserted successfully");
    }
  });
});

module.exports = router;
