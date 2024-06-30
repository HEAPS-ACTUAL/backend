const query = require("../utils/PromisifyQuery");
const db = require("../models/ConnectionManager"); // Import the database connection

/*
------------------------------------------------------------------------------------------------------------------------------------
DATA BASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
async function storeRevisionSchedule(startDate, endDate, examName, examColour, arrayOfReviewDates) {
    try {
        const sqlQuery = 'Call addRevisionSchedule(?, ?, ?, ?, ?)';
        const returnedData = await query(sqlQuery, [startDate, endDate, examName, examColour, arrayOfReviewDates]);
        // console.log(returnedData);
    } 
    catch (error) {
        const msg = 'Error adding revision dates into database';
        console.error(msg + ': ' + error.message);
        throw new Error(msg);
    }
}

async function retrieveAllRevisionDatesByUser(req, res){
    const email = req.body.email;

    try {
        const sqlQuery = 'Call retrieveAllRevisionDatesByUser(?)';
        const returnedData = await query(sqlQuery, [email]);
        res.status(200).json(returnedData[0]);
    }
    catch (error){
        const msg = 'Error retrieving dates from db';
        console.error(msg + ': ' + error.message);
        res.status(404).json({message: msg});
    }
}

async function DeleteExistingExam(req, res) {
    const input_ScheduleId = req.body.scheduleID

    try{
        const sqlQuery = 'delete from Schedule where ScheduleID = ?;'
        const returnedData = await query(sqlQuery, [input_ScheduleId]);

        res.status(200).json('ok deleted entire exam from db');
    }
    catch (error){
        const msg = 'error deleting data from db';
        console.error(msg + ': ' + error.message);
        res.status(404).json({message: error});
    }
}

async function DeleteSpecificRevisionDate (req, res) {
    const input_ScheduleId = req.body.scheduleID
    const input_RevisionDate = req.body.revisionDate

    try{
        const sqlQuery = 'delete from RevisionDates where ScheduleID = ? and RevisionDate = ?;'
        const returnedData = await query(sqlQuery, [input_ScheduleId, input_RevisionDate]);
        res.status(200).json('ok deleted specific date from db');
    }
    catch (error){
        const msg = 'error deleting data from db';
        console.error(msg + ': ' + error.message);
        res.status(404).json({message: error});
    }
}

/*
------------------------------------------------------------------------------------------------------------------------------------
HELPER FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
const CalculateSpacedRepetitionDates = (startDate, endDate) => {

    const currentDate = new Date(startDate); // DONT CHANGE THIS, need this for the while loop calculation
    const currentDateCorrectFormat = currentDate.toISOString().split('T')[0]; // Format date to YYYY-MM-DD to push into reviewDates array
    const reviewDates = [currentDateCorrectFormat];

    let intervals;

    if (endDate === null) {
        let intervalDays = 1;
        const factor = 1.2; // multiply intervals by 1.2
        const endDate = new Date(startDate); // Copy start date to calculate the end date
        
        endDate.setMonth(endDate.getMonth() + 6); // Set end date to 6 months after the start date

        while (currentDate < endDate) {
            currentDate.setDate(currentDate.getDate() + Math.round(intervalDays));

            // Stop if the next review date is beyond six months
            if (currentDate >= endDate) {
                break;
            }

            reviewDates.push(currentDate.toISOString().split('T')[0]); // store the formatted date into review dates array 
            intervalDays *= factor; // Increase the interval by the factor
        }

    }
    else {

        const end = new Date(endDate);

        // ensure start date is before end date
        if (currentDate >= end) {
            throw new Error('Start date must be before End date'); // window alert for this (unable to do this yet)
        }

        // Calculate the number of days between start date and end date
        const daysBetween = Math.ceil((end - currentDate) / (1000 * 60 * 60 * 24));


        // set the intervals based on the number of days btwn startDate and endDate
        if (daysBetween <= 7) {
            intervals = [1, 1, 1, 1];
        }
        else if (daysBetween <= 14) {
            intervals = [1, 3, 5, 5];
        }
        else if (daysBetween <= 21) {
            intervals = [2, 5, 9, 14, 21];
        }
        else if (daysBetween <= 28) {
            intervals = [2, 4, 7, 7, 7];
        }
        else if (daysBetween <= 35) {
            intervals = [1, 3, 4, 6, 6, 7, 8];
        }
        else if (daysBetween <= 42) {
            intervals = [1, 3, 4, 6, 6, 7, 7, 8];
        }
        else if (daysBetween <= 49) {
            intervals = [1, 3, 4, 6, 6, 7, 7, 7, 8];
        }
        else if (daysBetween <= 56) {
            intervals = [1, 3, 4, 6, 6, 7, 7, 7, 7, 8, 8];
        }
        else {
            // intervals = [];
            let intervalDays = 1; // starting interval
            const factor = 1.2; // x1.5 to calculate the next interval days
            const endDate = new Date(startDate);
          

            while (currentDate < end) {
                currentDate.setDate(currentDate.getDate() + Math.round(intervalDays)); // set the current date as the next review date

                // stop if the next review date is beyond the end date
                if (currentDate >= end) {
                    break;
                }

                reviewDates.push(currentDate.toISOString().split('T')[0]); // store the formatted date into review dates array 
                intervalDays *= factor;
            }   
        }

        let IntervalIndex = 0;

        while (currentDate < end && IntervalIndex < intervals.length) {
            currentDate.setDate(currentDate.getDate() + intervals[IntervalIndex]);
            const formattedDate = currentDate.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
            reviewDates.push(formattedDate); // Store the formatted date
            IntervalIndex++;
        }
    }
    // console.log(reviewDates);
    return JSON.stringify(reviewDates);
}


/*
------------------------------------------------------------------------------------------------------------------------------------
THIS FUNCTION WILL BE CALLED WHEN USER CLICKS 'GENERATE SCHEDULE' ON THE FRONTEND
------------------------------------------------------------------------------------------------------------------------------------
*/
async function createNewExam(req, res) {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const examName = req.body.examName;
    const examColour = req.body.examColour;

    try {
        // Calculate spaced repetition dates based on the start and end date
        const arrayOfReviewDates = CalculateSpacedRepetitionDates(startDate, endDate);       

        // Insert into both Schedule and RevisionDates table
        await storeRevisionSchedule(startDate, endDate, examName, examColour, arrayOfReviewDates);
        res.status(200).json({ message: 'Exam and revision dates added' });
        console.log('Exam and revision dates created completed successfully.');
    } catch (error) {
        console.error('Failed to create exam and revision dates:', error);
        res.status(404).json({message: error})
    }
}

// TO TEST THE ABOVE FUNCTION
// createNewExam(
//     req = 
//         {
//             body:
//                 {
//                     startDate: '2024-05-06',
//                     endDate: '2024-09-10',
//                     examName:'testing exam 3'
//                 }
//         },
//     res = null
// )

module.exports = { createNewExam, retrieveAllRevisionDatesByUser, DeleteExistingExam, DeleteSpecificRevisionDate};