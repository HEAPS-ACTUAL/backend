const {executeQuery} = require("../models/ConnectionManager");

async function addAllQuestionsForATest(arrayOfValues){
    try{
        console.log(arrayOfValues)
        const sqlQuery = "INSERT INTO `Question` (`TestID`, `QuestionNo`, `QuestionText`, `Elaboration`) VALUES (?,?,?,?)";
        const insertOk = await executeQuery(sqlQuery, [arrayOfValues]);
        
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
