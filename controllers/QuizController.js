const query = require('../utils/Promisify');

async function createNewQuiz(email, quizName, difficulty){
    try{
        const quizID = await countTotalNumberOfQuizzes(email) + 1;
        const sqlQuery = 'Insert into quiz (UserEmail, QuizID, QuizName, Difficulty) values (?, ?, ?, ?)';
        const insertOk = await query(sqlQuery, [email, quizID, quizName, difficulty]);

        if (insertOk){
            console.log('Quiz added!');
        }
    }
    catch(error){
        console.log(`Error adding quiz into database: ${error}`)
    }
}

async function countTotalNumberOfQuizzes(email){
    try{
        const sqlQuery = 'select count(*) as numOfQuizzes from quiz where UserEmail = ?';
        const returnedData = await query(sqlQuery, [email]);
        const numOfQuizzes = returnedData[0].numOfQuizzes
        // console.log(numOfQuizzes);

        return (numOfQuizzes);
    }
    catch(error){
        console.log(`Error counting number of quizzes: ${error}`)
    }
}

// To test the functions
// createNewQuiz('alice@gmail.com', 'math', 'E'); 
// countTotalNumberOfQuizzes('alice@gmail.com');

module.exports = {createNewQuiz};