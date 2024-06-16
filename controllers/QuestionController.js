const query = require("../utils/PromisifyQuery");

async function addNewQuestion(email, quizID, questionText, elaboration) {
    try {
        const questionNo = (await countTotalNumberOfQuestions(null, null, email, quizID)) + 1;
        const sqlQuery = "Insert into question (UserEmail, QuizID, QuestionNo, QuestionText, Elaboration) values (?, ?, ?, ?, ?)";
        const insertOk = await query(sqlQuery, [email, quizID, questionNo, questionText, elaboration]);

        if (insertOk) {
            console.log(`Question ${questionNo} added!`);
            return questionNo;
        }
    } catch (error) {
        const msg = `Error adding question ${questionNo} into database`;
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

async function countTotalNumberOfQuestions(req, res, email = null, quizID = null) {
    try {
        const sqlQuery = "select count(*) as numOfQuestions from question where UserEmail = ? and QuizID = ?";
        
        if(req && res){
            const email = req.body.email;
            const quizID = req.body.quizID;
            const returnedData = await query(sqlQuery, [email, quizID]);
            const numOfQuestions = returnedData[0].numOfQuestions;
            return res.status(200).json(numOfQuestions);
        }
        else if(email && quizID){
            const returnedData = await query(sqlQuery, [email, quizID]);
            const numOfQuestions = returnedData[0].numOfQuestions;
            return numOfQuestions;
        }
    } catch (error) {
        console.error(`Error counting number of questions: ${error}`);
    }
}

async function getLastTwoQuestions(email, quizID) {
    try {
        const sqlQuery = `
            SELECT *
            FROM Question
            WHERE UserEmail = ? AND QuizID = ?
            ORDER BY QuestionNo DESC
            LIMIT 2;
        `;
        const results = await query(sqlQuery, [email, quizID]);
        return results.reverse(); // Reverse to maintain the order of insertion when displaying
    }
    catch (error) {
        console.error("Error fetching the last two questions:", error);
        throw error;
    }
}

// To test the functions
// createNewQuestion('alice@gmail.com', 1, 'what is sodium chloride?', 'sodium chloride is salt!');

module.exports = { addNewQuestion, getLastTwoQuestions, countTotalNumberOfQuestions };
