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

module.exports = { createNewQuiz };