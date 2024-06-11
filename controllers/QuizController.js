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

// To test the insert functions
// createNewQuiz('alice@gmail.com', 'math', 'E');
// countTotalNumberOfQuizzes('alice@gmail.com');

const openAI = require('openai');
require('dotenv').config({path: '../.env'});

const { extractTextFromPDF } = require("./FileController");

async function generateSampleQuestions(req, res){
    try{
        console.log('extracting text now...');
        const extractedText = await extractTextFromPDF(req, res);
        console.log('querying chatgpt now...');
        const questions = await generateQuiz(extractedText);
        // console.log(questions);
        return res.status(200).json({questions: questions});
    }
    catch(error){
        res.status(404).json({message: error});
    }
}

async function generateQuiz(extractedText){
    const chatgpt = new openAI({apiKey: process.env.OPENAI_API_KEY});

    try{
        const numberOfQuestions = 10;
        const difficultyLevel = 'easy'; // This can be changed to take in an input from the user, allowing them to choose the diffiulty of the questions
        const query = 
        `${extractedText} \n\n
        Based on the text above, generate ${numberOfQuestions} questions. These questions should test how well I know the content of the given text. The difficulty level of the questions should be ${difficultyLevel}. \n\n
        
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

        // QUESTIONS:
        // {
        // "QuestionNumber": ,
        // "ActualQuestion": ,
        // "Explanation":
        // }

        // OPTIONS:
        // {
        // "Option": , 
        // "IsCorrect?": 
        // }

        // (question1, explanation on the correct answer) |
        // (question2, explanation on the correct answer) |
        // (question3, explanation on the correct answer) |
        // ... |
        // (question${numberOfQuestions}, explanation on the correct answer)
        // ] \n
        
        // OPTIONS: {
        // 'question 1': [('option A', isCorrect?) | ('option B', isCorrect?) | ('option C', isCorrect)? | ('option D', isCorrect?)],
        // 'question 2': [('option A', isCorrect?) | ('option B', isCorrect?) | ('option C', isCorrect)? | ('option D', isCorrect?)],
        // 'question 3': [('option A', isCorrect?) | ('option B', isCorrect?) | ('option C', isCorrect)? | ('option D', isCorrect?)],
        // ... ,
        // 'question${numberOfQuestions}': [('option A', isCorrect?) | ('option B', isCorrect?) | ('option C', isCorrect?) | ('option D', isCorrect?)]
        // }`;

        const response = await chatgpt.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: query }],
            temperature: 0,
            max_tokens: 2000,
        })
        
        console.log(response.choices[0].finish_reason);
        questions = response.choices[0].message.content;
        
        return questions;
    }
    catch(error){
        res.status(404).json({message: error})
    }
}

const CHATGPT_response = require('../JERRICK TEST (ill delete this after awhile)/temporary');

async function sortAndStoreQuiz(chatgpt_response){
    let question_obj_list = chatgpt_response.split('|||');
    
    for(let question_obj of question_obj_list){
        let x = JSON.parse(question_obj);
        console.log(x);
    }
}

sortAndStoreQuiz(CHATGPT_response);

module.exports = {generateSampleQuestions, generateQuiz, createNewQuiz};