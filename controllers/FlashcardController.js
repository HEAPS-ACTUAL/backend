const query = require("../utils/PromisifyQuery");

async function getAllFlashcardsWithoutSchedule(req, res) {
    const email = req.body.email;

    try {
        const sqlQuery = 'Select TestID as value, TestName as label from Test where (Email = ?) and (TestType = "F") and isnull(ScheduleID)';
        const returnedData = await query(sqlQuery, [email]);
        res.status(200).json(returnedData);
    } 
    catch (error) {
        const msg = `Error retrieving flashcards from DB!`;
        console.error(`${msg}: ${error.message}`);
        res.status(404).json({ message: msg });
    }
}

async function getFlashcardsByScheduleID(req, res) {
    const scheduleID = req.body.scheduleID;

    try {
        const sqlQuery = "Select TestID, TestName, DateTimeCreated from Test where ScheduleID = ?";
        const returnedData = await query(sqlQuery, [scheduleID]);

        res.status(200).json(returnedData);
    }
    catch (error) {
        console.error("Failed to fetch tests:", error);
        res.status(404).json({ message: error });
    }
}

module.exports = { getAllFlashcardsWithoutSchedule, getFlashcardsByScheduleID };
