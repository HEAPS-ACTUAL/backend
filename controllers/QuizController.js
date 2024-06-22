const query = require('../utils/PromisifyQuery');

/*
------------------------------------------------------------------------------------------------------------------------------------
SQL DATABASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
async function createNewQuiz(testID, difficulty){
    try {
        const sqlQuery = 'Insert into Quiz (TestID, Difficulty) values (?, ?)';
        const insertOk = await query(sqlQuery, [testID, difficulty]);

        if (insertOk) {
            console.log('Quiz has been added into database!');
        }
    }
    catch (error) {
        const msg = `Error adding quiz into database`
        console.error(`${msg}: ${error.message}`);
        throw new Error(`${msg}`);
    }
}

async function markQuizAsDone(req, res){
    const testID = req.body.testID;
    try {
        const sqlQuery = 'Update Quiz set IsDone = true where TestID = ?';
        await query(sqlQuery, [testID]);

        console.log(`TestID ${testID} has been marked as done!`);
        res.status(200).json({message: `TestID ${testID} has been marked as done!`})
    }
    catch (error) {
        console.error(error);
        res.status(404).json({message: error});        
    }
}

module.exports = { createNewQuiz, markQuizAsDone };