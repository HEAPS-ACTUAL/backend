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

async function storeUserQuizAnswers(req, res){
    const testID = req.body.testID
    const userAnswers = req.body.userAnswers;

    const formattedUserAnswers = formatUserAnswers(userAnswers); // FUNCTION DEFINED BELOW

    try{
        const sqlQuery = 'Call storeUserQuizAnswers(?, ?)';
        await query(sqlQuery, [testID, formattedUserAnswers]);
        console.log(`User's answers has been stored!`);
    }
    catch(error){
        console.error(error);
        res.status(404).json({message: error});
    }
}

function formatUserAnswers(userAnswers){
    `const this_is_how_userAnswers_looks_like = 
    {
        "1": "A",
        "2": "B",
        "3": "B",
        "4": "C",
        "5": "C",
        "6": "C",
        "7": "C",
        "8": "C",
        "9": "C",
        "10": "C"
    }`
    
    const returnedArray = [];
    
    for(let questionNo in userAnswers){
        let letter = userAnswers[questionNo];
        
        returnedArray.push({'QuestionNo': parseInt(questionNo), 'UserChoice': letter});
    }
    
    return (JSON.stringify(returnedArray));
}

async function reviewQuiz(req, res){
    const testID = req.body.testID;
    const attemptNo = req.body.attemptNo;

    try{
        const sqlQuery = 'call reviewQuiz(?, ?)';
        const returnedData = await query(sqlQuery, [testID, attemptNo]); // Go to 'test_format_examples/reviewQuiz.js' to see how returnedData looks like
        res.status(200).json(returnedData[0]);
    }
    catch(error){
        console.error(error);
        res.status(404).json({message: error});
    }
}

async function getLatestAttempt(req, res){
    const testID = req.body.testID;

    try{
        const sqlQuery = 'Select max(AttemptNo) as LatestAttempt from UserQuizScores where TestID = ?';
        const returnedData = await query(sqlQuery, [testID]);
        res.status(200).json(returnedData[0]);
    }
    catch(error){
        console.error(error);
        res.status(404).json({message: error});
    }
}

module.exports = { createNewQuiz, markQuizAsDone, storeUserQuizAnswers, reviewQuiz, getLatestAttempt };