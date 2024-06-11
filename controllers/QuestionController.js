const query = require('../utils/Promisify');

async function addNewQuestion(email, quizID, questionText, elaboration){
    try{
        const questionNo = await countTotalNumberOfQuestions(email, quizID) + 1;
        const sqlQuery = 'Insert into question (UserEmail, QuizID, QuestionNo, QuestionText, Elaboration) values (?, ?, ?, ?, ?)';
        const insertOk = await query(sqlQuery, [email, quizID, questionNo, questionText, elaboration]);

        if (insertOk){
            console.log('Question added!');
            return questionNo;
        }
    }
    catch(error){
        console.log(`Error adding question into database: ${error}`)
    }
}

async function countTotalNumberOfQuestions(email, quizID){
    try{
        const sqlQuery = 'select count(*) as numOfQuestions from question where UserEmail = ? and QuizID = ?';
        const returnedData = await query(sqlQuery, [email, quizID]);
        const numOfQuestions = returnedData[0].numOfQuestions;
        // console.log(numOfQuestions);

        return (numOfQuestions);
    }
    catch(error){
        console.log(`Error counting number of questions: ${error}`)
    }
}

// To test the functions
// createNewQuestion('alice@gmail.com', 1, 'what is sodium chloride?', 'sodium chloride is salt!');

module.exports = {addNewQuestion};