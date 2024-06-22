const query = require("../utils/PromisifyQuery");

/*
------------------------------------------------------------------------------------------------------------------------------------
SQL DATABASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/

async function addAllQuestionsForATest(arrayOfValues){
    try{
        const sqlQuery = "Insert into question (TestID, QuestionNo, QuestionText, Elaboration) values ?";
        const insertOk = await query(sqlQuery, [arrayOfValues]);
        
        if(insertOk.affectedRows === arrayOfValues.length){
            console.log('All questions for this test has been inserted!');
        }
        else{
            console.log('Not all questions have been inserted!');
        }
    }
    catch(error){
        const msg = `Error adding questions into database`;
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

async function getLastTwoQuestions(testID) { // to change
    try {
        const sqlQuery = `
            SELECT *
            FROM Question
            WHERE TestID = ?
            ORDER BY QuestionNo DESC
            LIMIT 2;
        `;
        const results = await query(sqlQuery, [testID]);
        return results.reverse(); // Reverse to maintain the order of insertion when displaying
    }
    catch (error) {
        console.error("Error fetching the last two questions:", error);
        throw error;
    }
}

// To test the functions
// createNewQuestion('alice@gmail.com', 1, 'what is sodium chloride?', 'sodium chloride is salt!');

module.exports = { addAllQuestionsForATest, getLastTwoQuestions };
