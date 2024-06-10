
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
=======
const openAI = require('openai');
require('dotenv').config({path: '../.env'});

const { extractTextFromPDF } = require("./FileController");

async function generateSampleQuestions(req, res){
    try{
        console.log('function is being called!');
        // console.log(req);
        const extractedText = await extractTextFromPDF(req, res);
        const questions = await generateQuiz(extractedText);
        console.log(questions);
        res.status(200).json({questions: questions});
    }
    catch(error){
        res.status(404).json({message: error});
    }    
}

async function generateQuiz(extractedText){
    const chatgpt = new openAI({apiKey: process.env.OPENAI_API_KEY});

    try{
        const numberOfQuestions = 10;
        const query = `Generate ${numberOfQuestions} questions based on the following text:\n\n${extractedText}`;

        const response = await chatgpt.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: query }],
            temperature: 0,
            max_tokens: 1000,
        })

        questions = response.choices[0].message.content;
        return questions;
    }
    catch(error){
        res.status(404).json({message: error})
    }
}

module.exports = {generateSampleQuestions, generateQuiz};
