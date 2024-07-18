const query = require("../utils/PromisifyQuery");

async function addAllQuestionsForATest(arrayOfValues){
    try{
        const sqlQuery = "Insert into Question (TestID, QuestionNo, QuestionText, Elaboration) values ?";
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

module.exports = { addAllQuestionsForATest };
