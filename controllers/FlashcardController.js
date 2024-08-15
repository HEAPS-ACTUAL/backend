const {execute, query} = require("../models/ConnectionManager");

async function getAllFlashcardsWithoutSchedule(req, res) {
    const email = req.query.email;

    try {
        const sqlQuery = 'Select TestID as value, TestName as label from Test where (Email = ?) and (TestType = "F") and isnull(ScheduleID)';
        const returnedData = await execute(sqlQuery, [email]);
        res.status(200).json(returnedData);
    } 
    catch (error) {
        const msg = `Error retrieving flashcards from DB!`;
        console.error(`${msg}: ${error.message}`);
        res.status(404).json({ message: msg });
    }
}

async function getFlashcardsByScheduleID(req, res) {
    const scheduleID = req.query.scheduleID;

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

async function updateFlashcard(req, res) {
    const testID = req.body.testID;
    const updatedText = req.body.updatedText; // input from user
    const questionNo = req.body.questionNo;
    const isBack = req.body.isBack; // true if updating front, false if updating back
    let sqlQuery;

    try {
        if (isBack){
            sqlQuery = "UPDATE Question SET Elaboration = ? WHERE TestID = ? AND QuestionNo = ?";
        }else{
            sqlQuery = "UPDATE Question SET QuestionText = ? WHERE TestID = ? AND QuestionNo = ?";

        }
        await execute(sqlQuery, [updatedText, testID, questionNo]);
        res.status(200).json({ message: "Flashcard updated successfully" });
    }
    catch (error) {
        console.error("Failed to update flashcard:", error);
        res.status(404).json({ message: error });
    }
}

module.exports = { getAllFlashcardsWithoutSchedule, getFlashcardsByScheduleID, updateFlashcard };
