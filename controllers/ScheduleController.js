const query = require("../utils/PromisifyQuery");
const db = require("../models/ConnectionManager"); // Import the database connection

/*
------------------------------------------------------------------------------------------------------------------------------------
DATA BASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/

async function storeRevisionSchedule( startDate, endDate, examName, examColour, arrayOfTestIDs, arrayOfReviewDates) {
    arrayOfTestIDs = JSON.stringify(arrayOfTestIDs);

    try {
        const sqlQuery = "Call addRevisionSchedule(?, ?, ?, ?, ?, ?)";
        const returnedData = await query(sqlQuery, [startDate, endDate, examName, examColour, arrayOfTestIDs, arrayOfReviewDates]);
        // console.log(returnedData);
    } 
    catch (error) {
        const msg = "Error adding revision dates into database";
        console.error(msg + ": " + error.message);
        throw new Error(msg);
    }
}

async function retrieveAllRevisionDatesByUser(req, res) {
    const email = req.body.email;

    try {
        const sqlQuery = "Call retrieveAllRevisionDatesByUser(?)";
        const returnedData = await query(sqlQuery, [email]);
        res.status(200).json(returnedData[0]);
    } 
    catch (error) {
        const msg = "Error retrieving dates from db";
        console.error(msg + ": " + error.message);
        res.status(404).json({ message: msg });
    }
}

async function deleteExistingExam(req, res) {
    const input_ScheduleId = req.body.scheduleID;

    try {
        const sqlQuery = "call deleteEntireSchedule(?)";
        const returnedData = await query(sqlQuery, [input_ScheduleId]);

        res.status(200).json("ok deleted entire exam from db");
    } 
    catch (error) {
        const msg = "error deleting data from db";
        console.error(msg + ": " + error.message);
        res.status(404).json({ message: error });
    }
}

async function deleteSpecificRevisionDate(req, res) {
    const input_ScheduleId = req.body.scheduleID;
    const input_RevisionDate = req.body.revisionDate;

    try {
        const sqlQuery = "call deleteOneRevisionDate(?, ?)";
        const returnedData = await query(sqlQuery, [input_ScheduleId, input_RevisionDate]);
        res.status(200).json("ok deleted specific date from db");
    } 
    catch (error) {
        const msg = "error deleting data from db";
        console.error(msg + ": " + error.message);
        res.status(404).json({ message: error });
    }
}

/*
------------------------------------------------------------------------------------------------------------------------------------
HELPER FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
const CalculateSpacedRepetitionDates = (startDateString, endDateString) => {
    var reviewDatesArray = [startDateString];

    if (endDateString === null) {
        var endDate = new Date(startDateString); // Initialise end date as the start date so that we can add 6 months to the start date
        var endMonth = endDate.getMonth() + 6; // Set end date to be 6 months after start date
        endDate.setMonth(endMonth);
    } 
    else {
        var endDate = new Date(endDateString);
    }

    var reviewDate = new Date(startDateString);
    var intervalDays = 1;
    var factor = 1.2; // multiply intervals by 1.2

    while (reviewDate < endDate) {
        reviewDate.setDate(reviewDate.getDate() + Math.round(intervalDays));

        // Stop if the next review date exceeds the end date
        if (reviewDate >= endDate) {
            break;
        }

        var reviewDateString = reviewDate.toISOString().split("T")[0];
        reviewDatesArray.push(reviewDateString); // append the formatted date into review dates array
        intervalDays *= factor; // Increase the interval by the factor
    }

    // MAKE SURE THE VERY LAST REVISION DATE IS ALWAYS ONE DAY BEFORE THE EXAM
    var oneDayBeforeEndDate = endDate.getDate() - 1;

    endDate.setDate(oneDayBeforeEndDate);
    
    var oneDayBeforeEndDateString = endDate.toISOString().split("T")[0];

    if (!reviewDatesArray.includes(oneDayBeforeEndDateString)) {
        reviewDatesArray.push(oneDayBeforeEndDateString);
    }

    console.log(reviewDatesArray);
    return JSON.stringify(reviewDatesArray);
}

/*
------------------------------------------------------------------------------------------------------------------------------------
THIS FUNCTION WILL BE CALLED WHEN USER CLICKS 'GENERATE SCHEDULE' ON THE FRONTEND. THIS FUNCTION IS TO STORE DATA INTO DB
------------------------------------------------------------------------------------------------------------------------------------
*/
async function createNewExam(req, res) {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const examName = req.body.examName;
    const examColour = req.body.examColour;
    const arrayOfTestIDs = req.body.arrayOfTestIDs;

    try {
        // Calculate spaced repetition dates based on the start and end date
        const arrayOfReviewDates = CalculateSpacedRepetitionDates(startDate, endDate);

        // Insert into both Schedule and RevisionDates table
        await storeRevisionSchedule(startDate, endDate, examName, examColour, arrayOfTestIDs, arrayOfReviewDates);

        res.status(200).json({ message: "Exam and revision dates added" });
        console.log("Exam and revision dates created successfully.");
    } 
    catch (error) {
        console.error("Failed to create exam and revision dates:", error);
        res.status(404).json({ message: error });
    }
}

module.exports = { createNewExam, retrieveAllRevisionDatesByUser, deleteExistingExam, deleteSpecificRevisionDate };
