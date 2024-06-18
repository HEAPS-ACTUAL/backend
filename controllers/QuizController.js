// MODULES
const query = require('../utils/PromisifyQuery');
const openAI = require('openai');
require('dotenv').config({ path: '../.env' });

// FUNCTIONS AND VARIABLES
const CHATGPT_response = require('../JERRICK TEST (ill delete this after awhile)/temporary');
const { extractTextFromPDF } = require("./FileController");
const { addNewQuestion } = require('./QuestionController');
const { addNewOption } = require('./OptionController');

/*
------------------------------------------------------------------------------------------------------------------------------------
SQL DATABASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
async function createNewQuiz(email, quizName, difficulty) {
    try {
        const quizID = await determineTheNextQuizID(email); // FUNCTION DEFINED BELOW
        const sqlQuery = 'Insert into quiz (UserEmail, QuizID, QuizName, Difficulty) values (?, ?, ?, ?)';
        const insertOk = await query(sqlQuery, [email, quizID, quizName, difficulty]);

        if (insertOk) {
            console.log(`Quiz ${quizID} added for ${email}!`);
            return quizID;
        }
    }
    catch (error) {
        const msg = `Error adding quiz into database`
        console.error(`${msg}: ${error.message}`);
        throw new Error(`${msg}`);
    }
}

async function determineTheNextQuizID(email) {
    try {
        const sqlQuery = 'Select QuizID from quiz where useremail = ? order by quizID desc limit 1';
        const returnedData = await query(sqlQuery, [email]);

        if (returnedData.length == 0) {
            return 1; // IF NO QUIZ HAS BEEN CREATED BEFORE, USE NUMBER 1 AS THE NEXT QUIZ ID
        }

        const previousQuizID = returnedData[0].QuizID
        const nextQuizID = previousQuizID + 1;
        return nextQuizID;
    }
    catch (error) {
        console.error(`Error determining the next quizID: ${error}`)
    }
}

async function countTotalNumberOfQuizzes(email) {
    try {
        const sqlQuery = 'select count(*) as numOfQuizzes from quiz where UserEmail = ?';
        const returnedData = await query(sqlQuery, [email]);
        const numOfQuizzes = returnedData[0].numOfQuizzes
        // console.log(numOfQuizzes);

        return (numOfQuizzes);
    }
    catch (error) {
        console.error(`Error counting number of quizzes: ${error}`)
    }
}

async function getToDoQuizzes(req, res){
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

async function getCompletedQuizzes(req, res){
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

async function deleteQuiz(req, res) {
    const email = req.body.email;
    const quizID = req.body.quizID;
    const quizName = req.body.quizName;

    try {
        const sqlQuery = 'Delete from quiz where useremail = ? and quizid = ?';
        const deleteOk = await query(sqlQuery, [email, quizID]);
        res.status(200).json({ message: `${quizName} has been deleted!` });
    }
    catch (error) {
        console.log(`Could not delete ${quizName} due to the following error: ${error}`);
        res.status(404).json({ message: `Could not delete ${quizName}!` });
    }
}

/*
------------------------------------------------------------------------------------------------------------------------------------
THESE ARE JUST HELPER FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
async function queryChatgpt(difficulty, extractedText) {
    const chatgpt = new openAI({ apiKey: process.env.OPENAI_API_KEY });
    const numberOfQuestions = 12;

    const difficultyDict = { 'E': 'easy', 'M': 'intermediate', 'H': 'hard' };
    const difficultyString = difficultyDict[difficulty];

    try {
        const query =
            `${extractedText} \n\n
        Based on the text above, generate ${numberOfQuestions} questions. These questions should test how well I know the content of the given text. The difficulty level of the questions should be ${difficultyString}. \n\n
        
        The questions are multiple choice questions and each question should have 4 options (1 correct and 3 wrong). I also want a short explanation on which option is correct. \n
        
        Generate JSON objects for the questions with fields: "QuestionNumber", "ActualQuestion", "Explanation", "Options".
        "Options" is a list of JSON objects with fields: "Option", "IsCorrect?". \n
        
        Format your response exactly like this: \n
        {
        "QuestionNumber": ,
        "ActualQuestion": ,
        "Explanation":
        "Options" : 
            [{
            "Option": , 
            "IsCorrect?": 
            }]
        }|||`

        const response = await chatgpt.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: query }],
            temperature: 0,
            max_tokens: 2000,
        })

        console.log(response.choices[0].finish_reason); // ensure that the generation of questions doesnt not stop prematurely
        const questions = response.choices[0].message.content;
        console.log(questions); // check the questions generated by chatgpt

        return questions;
    }
    catch (error) {
        const msg = `An error occurred while generating the quiz questions`
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

async function formatAndStoreQuiz(email, quizName, difficulty, chatgpt_response) {
    try {
        const quizID = await createNewQuiz(email, quizName, difficulty);

        if (!quizID) {
            return 'Could not store quiz!';
        }

        let array_of_question_obj_strings = chatgpt_response.split('|||').slice(0, -1); // slice to remove last element of array because it is just an empty string

        for (let question_obj_string of array_of_question_obj_strings) {
            let question_obj = JSON.parse(question_obj_string); // this converts a string into a JSON

            const questionText = question_obj['ActualQuestion'];
            const elaboration = question_obj['Explanation'];

            let questionNo = await addNewQuestion(email, quizID, questionText, elaboration); // FUNCTION IMPORTED FROM QUESTION CONTROLLER

            const array_of_option_objects = question_obj['Options'];

            for (let option_obj of array_of_option_objects) {
                const optionText = option_obj['Option'];
                const isCorrect = option_obj['IsCorrect?'];

                let insertOk = await addNewOption(email, quizID, questionNo, optionText, isCorrect); // FUNCTION IMPORTED FROM OPTION CONTROLLER
            }
        }

        const everythingOk = true;
        return everythingOk;
    }
    catch (error) {
        throw new Error(`Error quiz adding into database: ${error.message}`);
    }
}

/*
------------------------------------------------------------------------------------------------------------------------------------
THIS FUNCTION WILL BE CALLED WHEN USER CLICKS 'GENERATE QUIZ' ON THE FRONTEND
------------------------------------------------------------------------------------------------------------------------------------
*/
async function generateAndStoreQuiz(req, res) {
    try {
        // CHECK WHETHER USER PRESSES GENERATE QUIZ WITHOUT UPLOADING ANYTHING
        if (!req.file) {
            res.status(404).json({ message: "No file uploaded!" });
            throw new Error("No file uploaded");
        }

        const email = req.body.email;
        const quizName = req.body.quizName;
        const difficulty = req.body.difficulty;
        const uploadedFile = req.file;

        // console.log(email, quizName, difficulty);

        console.log('Extracting text now...');
        const extractedText = await extractTextFromPDF(uploadedFile); // FUNCTION IMPORTED FROM FILE CONTROLLER

        console.log('Querying chatgpt for Quiz now...');
        const chatgptResponse = await queryChatgpt(difficulty, extractedText); // FUNCTION DEFINED ABOVE

        console.log('Questions and options obtained! Storing them into the database now...');
        const hasBeenStored = await formatAndStoreQuiz(email, quizName, difficulty, chatgptResponse); // FUNCTION DEFINED ABOVE

        if (hasBeenStored) {
            const msg = 'Quiz, questions and options have been stored in database!';
            console.log(msg)
            res.status(200).json({ message: msg });
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(404).json({ message: error.message });
    }
}

/*
------------------------------------------------------------------------------------------------------------------------------------
TO TEST THE ABOVE FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/

// To test the insert functions
// createNewQuiz('alice@gmail.com', 'math', 'E');
// countTotalNumberOfQuizzes('alice@gmail.com');

// To test formatAndStoreQuiz function
// async function test() {
//     const result = await formatAndStoreQuiz('jerricknsc@gmail.com', 'physics', 'M', CHATGPT_response);
//     console.log(result);
// }

// test();

module.exports = { generateAndStoreQuiz, getToDoQuizzes, getCompletedQuizzes };