const query = require('../utils/Promisify');

async function createNewQuiz(email, quizName, difficulty){
    try{
        const quizID = await countTotalNumberOfQuizzes(email) + 1;
        const sqlQuery = 'Insert into quiz (UserEmail, QuizID, QuizName, Difficulty) values (?, ?, ?, ?)';
        const insertOk = await query(sqlQuery, [email, quizID, quizName, difficulty]);

        if (insertOk){
            console.log('Quiz added!');
            return quizID;
        }
    }
    catch(error){
        console.log(`Error adding quiz into database: ${error}`);
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

async function queryChatgpt(difficulty, extractedText){
    const chatgpt = new openAI({apiKey: process.env.OPENAI_API_KEY});

    try{
        const numberOfQuestions = 10;
        
        const query = 
        `${extractedText} \n\n
        Based on the text above, generate ${numberOfQuestions} questions. These questions should test how well I know the content of the given text. The difficulty level of the questions should be ${difficulty}. \n\n
        
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
        
        console.log(response.choices[0].finish_reason); // ensure that the generate doesnt not stop prematurely
        questions = response.choices[0].message.content;
        
        return questions;
    }
    catch(error){
        res.status(404).json({message: error})
    }
}

const CHATGPT_response = require('../JERRICK TEST (ill delete this after awhile)/temporary');
const { addNewQuestion } = require('./QuestionController');
const { addNewOption } = require('./OptionController');

async function formatAndStoreQuiz(email, quizName, difficulty, chatgpt_response){
    try{
        const quizID = await createNewQuiz(email, quizName, difficulty);

        if(!quizID){
            return 'Could not store quiz!';
        }

        let array_of_question_obj_strings = chatgpt_response.split('|||');
        array_of_question_obj_strings = array_of_question_obj_strings.slice(0, -1); // removing last element of array because it is just an empty string
        
        for(let question_obj_string of array_of_question_obj_strings){
            let question_obj = JSON.parse(question_obj_string); // this converts a string into a JSON
            
            const questionText = question_obj['ActualQuestion'];
            const elaboration = question_obj['Explanation'];
            
            let questionNo = false;
            questionNo = await addNewQuestion(email, quizID, questionText, elaboration);

            if(!questionNo){
                return 'Could not store question!';
            }
            
            const array_of_option_objects = question_obj['Options'];

            for(let option_obj of array_of_option_objects){
                const optionText = option_obj['Option'];
                const isCorrect = option_obj['IsCorrect?'];
                
                const insertOk = false;
                insertOk = await addNewOption(email, quizID, questionNo, optionText, isCorrect);

                if(!insertOk){
                    return 'Could not store option!';
                }
            }        
        }

        return 'Quiz, questions and options have been stored in database!';
    }
    catch(error){
        return error;
    }
}

console.log(formatAndStoreQuiz('alice@gmail.com', 'sample quiz', 'E', CHATGPT_response));

const { extractTextFromPDF } = require("./FileController");

async function generateAndStoreQuiz(req, res){
    try{
        const email = req.body.email;
        const quizName = req.body.quizName;
        const difficulty = req.body.difficulty;

        // console.log(email, quizName, difficulty);

        console.log('Extracting text now...');
        const extractedText = await extractTextFromPDF(req, res);

        console.log('Querying chatgpt now...');
        const chatgptResponse = await queryChatgpt(difficulty, extractedText);

        console.log('Questions and options obtained! Storing them into the database now!');
        const hasBeenStored = await formatAndStoreQuiz(email, quizName, difficulty, chatgptResponse);
        
        if(hasBeenStored === 'Quiz, questions and options have been stored in database!'){
            res.status(200).json({message: hasBeenStored});
        }
        else{
            res.status(404).json({message: hasBeenStored});
        }
    }
    catch(error){
        res.status(404).json({message: error});
    }
}

module.exports = {generateAndStoreQuiz, queryChatgpt, createNewQuiz};