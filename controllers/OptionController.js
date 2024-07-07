const query = require('../utils/PromisifyQuery');

async function addAllOptionsForAQuiz(arrayOfValues){
    try{
        const sqlQuery = 'Insert into `Option` (TestID, QuestionNo, OptionLetter, OptionText, IsCorrect) values ?';
        const insertOk = await query(sqlQuery, [arrayOfValues]);
        
        if(insertOk.affectedRows === arrayOfValues.length){
            console.log('All options for this quiz has been inserted!');
        }
        else{
            console.log('Not all options have been inserted!');
        }
    }
    catch(error){
        const msg = `Error adding options into database`;
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

module.exports = {addAllOptionsForAQuiz};