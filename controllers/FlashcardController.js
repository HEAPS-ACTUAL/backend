const query = require('../utils/PromisifyQuery');

async function getAllFlashcardsWithoutSchedule(req, res){
    const email = req.body.email;

    try {
        const sqlQuery = 'Select TestID, TestName from Test where (Email = ?) and (TestType = "F") and isnull(ScheduleID)';
        const returnedData = await query(sqlQuery, [email]);
        res.status(200).json(returnedData);
    }
    catch (error) {
        const msg = `Error retrieving flashcards from DB!`;
        console.error(`${msg}: ${error.message}`);
        res.status(404).json({message: msg});
    }
}

module.exports = {getAllFlashcardsWithoutSchedule};