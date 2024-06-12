const query = require('../utils/Promisify');

async function createNewQuiz(email, quizName, difficulty){
    try{
        const quizID = await countTotalNumberOfQuizzes(email) + 1;
        const sqlQuery = 'Insert into quiz (UserEmail, QuizID, QuizName, Difficulty) values (?, ?, ?, ?)';
        const insertOk = await query(sqlQuery, [email, quizID, quizName, difficulty]);

        if (insertOk){
            console.log(`Quiz ${quizID} added for ${email}!`);
            return quizID;
        }
    }
    catch(error){
        const msg = `Error adding quiz into database`
        console.error(`${msg}: ${error.message}`);
        throw new Error(`${msg}`);
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

async function deleteQuiz(req, res){
    const email = req.body.email;
    const quizID = req.body.quizID;
    const quizName = req.body.quizName;

    try{
        const sqlQuery = 'Delete from quiz where useremail = ? and quizid = ?';
        const deleteOk = await query(sqlQuery, [email, quizID]);
        res.status(200).json({message: `${quizName} has been deleted!`});
    }
    catch(error){
        console.log(`Could not delete ${quizName} due to the following error: ${error}`);
        res.status(404).json({message: `Could not delete ${quizName}!`});
    }
}

// To test the insert functions
// createNewQuiz('alice@gmail.com', 'math', 'E');
// countTotalNumberOfQuizzes('alice@gmail.com');

const openAI = require('openai');
require('dotenv').config({path: '../.env'});

async function queryChatgpt(difficulty, extractedText){
    const chatgpt = new openAI({apiKey: process.env.OPENAI_API_KEY});
    const numberOfQuestions = 12;

    const difficultDict = {'E': 'easy', 'M': 'intermediate', 'D': 'difficult'};
    const difficultyString = difficultDict[difficulty];

    try{        
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
        
        console.log(response.choices[0].finish_reason); // ensure that the generate doesnt not stop prematurely
        const questions = response.choices[0].message.content;
        console.log(questions);
        
        return questions;
    }
    catch(error){
        const msg = `An error occurred while generating the quiz questions`
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
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

        let array_of_question_obj_strings = chatgpt_response.split('|||').slice(0, -1); // slice to remove last element of array because it is just an empty string
        
        for(let question_obj_string of array_of_question_obj_strings){
            let question_obj = JSON.parse(question_obj_string); // this converts a string into a JSON
            
            const questionText = question_obj['ActualQuestion'];
            const elaboration = question_obj['Explanation'];
            
            let questionNo = await addNewQuestion(email, quizID, questionText, elaboration);
            
            const array_of_option_objects = question_obj['Options'];

            for(let option_obj of array_of_option_objects){
                const optionText = option_obj['Option'];
                const isCorrect = option_obj['IsCorrect?'];
                
                let insertOk = await addNewOption(email, quizID, questionNo, optionText, isCorrect);
            }        
        }

        const everythingOk = true;
        return everythingOk;
    }
    catch(error){
        throw new Error(`Error quiz adding into database: ${error.message}`);
    }
}

// async function test(){
//     const result = await formatAndStoreQuiz('alice@gmail.com', 'sample quiz', 'E', CHATGPT_response);
//     console.log(result);
// }

// test();

const { extractTextFromPDF } = require("./FileController");

async function generateAndStoreQuiz(req, res){
    try{
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
        const extractedText = await extractTextFromPDF(uploadedFile);   

        console.log('Querying chatgpt now...');
        const chatgptResponse = await queryChatgpt(difficulty, extractedText);

        console.log('Questions and options obtained! Storing them into the database now!');
        const hasBeenStored = await formatAndStoreQuiz(email, quizName, difficulty, chatgptResponse);
        
        if(hasBeenStored){
            const msg = 'Quiz, questions and options have been stored in database!';
            console.log(msg)
            res.status(200).json({message: msg});
        }
    }
    catch(error){
        console.error(error.message);
        res.status(404).json({message: error.message});
    }
}

module.exports = {generateAndStoreQuiz, queryChatgpt};