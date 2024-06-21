const query = require('../utils/PromisifyQuery');

/*
------------------------------------------------------------------------------------------------------------------------------------
SQL DATABASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
async function createNewQuiz(testID, difficulty){
    try {
        const sqlQuery = 'Insert into Quiz (TestID, Difficulty) values (?, ?))';
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

async function getToDoQuizzes(req, res){ // to change
    const email = req.body.email;

    try{
        const sqlQuery = 'Select * from quiz where UserEmail = ? and IsDone = false';
        const returnedQuizzes = await query(sqlQuery, [email]);
        res.status(200).json(returnedQuizzes);
    }
    catch(error){
        res.status(404).json({ message: `Error retrieving undone quizzes!` });
    }
}

async function getCompletedQuizzes(req, res){ // to change
    const email = req.body.email;

    try{
        const sqlQuery = 'Select * from quiz where UserEmail = ? and IsDone = true';
        const returnedQuizzes = await query(sqlQuery, [email]);
        res.status(200).json(returnedQuizzes);
    }
    catch(error){
        res.status(404).json({ message: `Error retrieving undone quizzes!` });
    }
}


module.exports = { createNewQuiz, getToDoQuizzes, getCompletedQuizzes };