const query = require("../utils/PromisifyQuery");
const db = require("../models/ConnectionManager"); // Import the database connection


/*
------------------------------------------------------------------------------------------------------------------------------------
THIS FUNCTION WILL BE CALLED WHEN USER CLICKS 'GENERATE SCHEDULE' ON THE FRONTEND
------------------------------------------------------------------------------------------------------------------------------------
*/
const CalculateSpacedRepetitionDates = (startDate, endDate) => {

    const currentDate = new Date(startDate); // DONT CHANGE THIS, need this for the while loop calculation
    const currentDateCorrectFormat = currentDate.toISOString().split('T')[0]; // Format date to YYYY-MM-DD to push into reviewDates array
    const reviewDates = [currentDateCorrectFormat];

    let intervals;

    if (endDate === null) {
        let intervalDays = 1;
        const factor = 1.5; // multiply intervals by 1.5
        const endDate = new Date(startDate); // Copy start date to calculate the end date
        endDate.setMonth(endDate.getMonth() + 6); // Set end date to 6 months after the start date


        while (currentDate < endDate) {
            currentDate.setDate(currentDate.getDate() + Math.round(intervalDays));

            // Stop if the next review date is beyond six months
            if (currentDate >= endDate) {
                break;
            }

            reviewDates.push(currentDate.toISOString().split('T')[0]); // Store the formatted date
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

        console.log(daysBetween);

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
        else {
            intervals = [7, 14, 28];
        }

        let IntervalIndex = 0;

        while (currentDate < end && IntervalIndex < intervals.length) {
            currentDate.setDate(currentDate.getDate() + intervals[IntervalIndex]);
            const formattedDate = currentDate.toISOString().split('T')[0]; // Format date to YYYY-MM-DD
            reviewDates.push(formattedDate); // Store the formatted date
            IntervalIndex++;
        }
    }
    console.log(reviewDates);
    return reviewDates;
    
};


const start = '2004-04-22';
const end = null; 
CalculateSpacedRepetitionDates(start, end);




/*
------------------------------------------------------------------------------------------------------------------------------------
FUNCTIONS TO STORE DATA INTO DB 
------------------------------------------------------------------------------------------------------------------------------------
*/

async function createNewSchedule(StartDate, EndDate, ExamName){ // startDate, enddate, examName comes frm the FE
    try {
        const sqlQuery = 'Insert into Schedule (StartDate, EndDate, ExamName) values (?, ?, ?)';
        const insertOk = await query(sqlQuery, [StartDate, EndDate, ExamName]);

        if(insertOk) {
            console.log('exam has been added into database!');
        }
    }
    catch (error) {
        const msg = 'Error adding exam into database'
        console.error(`${msg}: ${error.message}`);
        throw new Error(`${msg}`);
    }
}


async function storeRevisionDates(scheduleId, revisionDates) {
    try {
        const values = revisionDates.map(date => [scheduleId, date]);  
        console.log("Prepared values for insertion:", JSON.stringify(values));

        const sqlQuery = 'INSERT INTO RevisionDates (ScheduleID, RevisionDate) VALUES ? ON DUPLICATE KEY UPDATE RevisionDate=VALUES(RevisionDate)';
        const [insertOk] = await query(sqlQuery, [values]);  

       
        if (insertOk) {
            console.log(`Successfully inserted/updated revision dates. Affected rows: ${insertOk.affectedRows}`);
        } else {
            console.log('No new dates were added or updated in the database.');
        }
    } 
    catch (error) {
        const msg = 'Error adding revision dates into database';
        console.error(msg + ': ' + error.message);
        throw new Error(msg);
    }
}





/*
------------------------------------------------------------------------------------------------------------------------------------
TO TEST THE ABOVE FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/

const startDate = '2004-04-22';
const endDate = null
const examName = 'my birthday';

async function setupNewEvent() {
    try {
        // Calculate spaced repetition dates based on the start and end date
        const revisionDates = CalculateSpacedRepetitionDates(startDate, endDate);

        // Insert the exam into the Schedule table
        await createNewSchedule(startDate, endDate, examName);

        const scheduleId = 1;

        // Insert the revision dates into the RevisionDates table
        await storeRevisionDates(scheduleId, revisionDates);

        console.log('Exam and revision dates setup completed successfully.');
    } catch (error) {
        console.error('Failed to setup exam and revision dates:', error);
    }
}


setupNewEvent();



module.export = {CalculateSpacedRepetitionDates, createNewSchedule, storeRevisionDates};
