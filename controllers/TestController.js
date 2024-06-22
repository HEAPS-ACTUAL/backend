// MODULES
const query = require('../utils/PromisifyQuery');
const openAI = require('openai');
require('dotenv').config({ path: '../.env' }); // this makes .env undetected for some reason

// FUNCTIONS AND VARIABLES
const { extractTextFromPDF } = require("./FileController");
const { addAllQuestionsForATest } = require('./QuestionController');
const { addAllOptionsForAQuiz } = require('./OptionController');
const { createNewQuiz } = require('./QuizController');

const extractedText = require("../test_ISAIAH/testpdf");
const CHATGPT_response_flashcard = require("../test_ISAIAH/test_GPT_response"); 
const CHATGPT_response_quiz = require('../JERRICK TEST (ill delete this after awhile)/temporary');

/*
------------------------------------------------------------------------------------------------------------------------------------
SQL DATABASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
async function createNewTest(email, testName, testType) {
    try {
        const testID = await determineTheNextTestID(); // FUNCTION DEFINED BELOW
        const sqlQuery = 'Insert into Test (email, testID, testName, testType) values (?, ?, ?, ?)';
        const insertOk = await query(sqlQuery, [email, testID, testName, testType]);

        if (insertOk) {
            console.log(`Test ${testID} added for ${email}!`);
            return testID;
        }
    }
    catch (error) {
        const msg = `Error adding Test into database`
        console.error(`${msg}: ${error.message}`);
        throw new Error(`${msg}`);
    }
}

async function determineTheNextTestID() {
    try {
        const sqlQuery = 'Select testID from Test order by testID desc limit 1';
        const returnedData = await query(sqlQuery);
        
        if (returnedData.length == 0) {
            return 1; // IF NO TEST HAS BEEN CREATED BEFORE, USE NUMBER 1 AS THE NEXT Test ID
        }

        const previousTestID = returnedData[0].testID
        const nextTestID = previousTestID + 1;
        return nextTestID;
    }
    catch (error) {
        console.error(`Error determining the next TestID: ${error}`)
    }
}

async function deleteTest(req, res) {
    const testID = req.body.testID;
    const testName = req.body.testName;

    try {
        const sqlQuery = 'Delete from Test where TestID = ?';
        
        await query(sqlQuery, [testID]);
        
        res.status(200).json({ message: `${testName} has been deleted!` });
    }
    catch (error) {
        console.log(`Could not delete ${testName} due to the following error: ${error}`);
        res.status(404).json({ message: `Could not delete ${testName}!` });
    }
}

/*
This function returns an array of row objects.
Each row object has the keys: "TestID", "TestName", "DateTimeCreated", "Difficulty" and "numOfQuestions".
*/
async function getTestInfo(req, res){
    const email = req.body.email;
    const testType = req.body.testType;
    
    if(req.body.testStatus){
        var testStatus = req.body.testStatus;
    }
    else{
        var testStatus = false;
    }
    
    try{
        const sqlQuery = 'call getTestInfo(?, ?, ?)';
        const returnedData = await query(sqlQuery, [email, testType, testStatus]);
        const testInfoArray = returnedData[0];
        
        res.status(200).json(testInfoArray);
    }
    catch(error){
        console.error(error.message);
        res.status(404).json({message: error.message});
    }
}

/*
Go to examples/testQuestionAndOptions.js to see an example of what this function returns.
Take note: "Options" is a string, not an object.
*/
async function getAllQuestionsAndOptionsFromATest(req, res){ 
    const testID = req.body.testID;

    try{
        const sqlQuery = 'call getAllQuestionsAndOptionsForATest(?)';
        const returnedData = await query(sqlQuery, [testID]);
        const questionsOfThisTest = returnedData[0];
        
        res.status(200).json(questionsOfThisTest);
    }
    catch(error){
        console.error(`Could not get questions and options: ${error}`);
        res.status(404).json({message: error});
    }
}

/*
------------------------------------------------------------------------------------------------------------------------------------
THESE ARE JUST HELPER FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
function getPrompt(testType, difficulty, numOfQuestions=12){
    // For now, function is just for these two entities, future entities may require more if-else statements instead
    const promptDict = {
        'F': () =>`Based on the text above, generate a maximised number of Test questions. These questions should test how well I know the content of the given text. \n\n
        
        Use a variety of formats for the questions such as "Define this term", "Describe this process", “True or false”, “Fill in the blank”. There should also be an Elaboration. \n
        
        Generate JSON objects for the questions with fields: "QuestionNumber", "ActualQuestion", "Elaboration". \n
        
        Format your response exactly like this: \n
        {
        "QuestionNumber": ,
        "ActualQuestion": ,
        "Elaboration":
        }|||`,

        'Q': (numOfQuestions, difficulty) => `Based on the text above, generate ${numOfQuestions} questions. These questions should test how well I know the content of the given text. The difficulty level of the questions should be ${difficulty}. \n\n
        
        The questions are multiple choice questions and each question should have 4 options (1 correct and 3 wrong). I also want a short elaboration on which option is correct. \n
        
        Generate JSON objects for the questions with fields: "QuestionNumber", "ActualQuestion", "Elaboration", "Options".
        "Options" is a list of JSON objects with fields: "Option", "IsCorrect?". \n
        
        Format your response exactly like this: \n
        {
        "QuestionNumber": ,
        "ActualQuestion": ,
        "Elaboration":
        "Options" : 
            [{
            "Option": , 
            "IsCorrect?": 
            }]
        }|||`
    }

    if (testType === "F"){
        return promptDict[testType]();
    }

    return promptDict[testType](numOfQuestions, difficulty);
}

async function queryChatgptForTest(extractedText, testType, difficulty) {
    const chatgpt = new openAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = getPrompt(testType, difficulty, numOfQuestions=12); // contains key-value for appropriate Test prompt
    // console.log(prompt);
    
    try {
        const query =
            `${extractedText} \n\n` + prompt;
        
        const response = await chatgpt.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: query }],
            temperature: 0.7,
            max_tokens: 3000,
        })

        console.log(response.choices[0].finish_reason); // ensure that the generation of questions doesnt not stop prematurely
        const questions = response.choices[0].message.content;
        console.log(questions); // check the questions generated by chatgpt

        return questions;
    }
    catch (error) {
        const msg = `An error occurred while generating the Test questions`
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

async function formatAndStoreTest(email, testName, testType, difficulty, chatgpt_response) {
    try {
        const testID = await createNewTest(email, testName, testType);
        
        if (!testID) {
            throw new Error('Could not store Test!'); 
        }

        let array_of_question_obj_strings = chatgpt_response.split('|||').slice(0, -1); // slice to remove last element of array because it is just an empty string
        // console.log(array_of_question_obj_strings);
        
        const array_of_all_questions = [];
        const array_of_all_options = [];

        for (let question_obj_string of array_of_question_obj_strings) {
            const question_obj = JSON.parse(question_obj_string); // this converts a string into a JSON
            
            const questionNo = question_obj['QuestionNumber'];
            const questionText = question_obj['ActualQuestion'];
            const elaboration = question_obj['Elaboration'];
            
            array_of_all_questions.push([testID, questionNo, questionText, elaboration]);

            if(question_obj['Options']){
                const letterArray = ['A', 'B', 'C', 'D'];
                
                for(let i = 0; i < question_obj['Options'].length; i += 1){
                    const option_obj = question_obj['Options'][i];
                    
                    const currentLetter = letterArray[i];
                    const optionText = option_obj['Option'];
                    const isCorrect = option_obj['IsCorrect?'];

                    array_of_all_options.push([testID, questionNo, currentLetter, optionText, isCorrect]);
                }
            }
        }

        await addAllQuestionsForATest(array_of_all_questions); // FUNCTION IMPORTED FROM QUESTION CONTROLLER

        if(testType === 'Q'){
            await addAllOptionsForAQuiz(array_of_all_options); // FUNCTION IMPORTED FROM OPTION CONTROLLER
            await createNewQuiz(testID, difficulty); 
        }

        return true;
    }
    catch (error) {
        throw new Error(error.message);
    }
}


/*
------------------------------------------------------------------------------------------------------------------------------------
THIS FUNCTION WILL BE CALLED WHEN USER CLICKS 'GENERATE' ON THE FRONTEND
------------------------------------------------------------------------------------------------------------------------------------
*/
async function generateAndStoreTest(req, res) {
    try {
        const email = req.body.email; // string
        const testName = req.body.testName; // string
        const difficulty = req.body.difficulty; // string: "Easy", "Intermediate" or "Hard"
        const testType = req.body.testType; // single str ch: "Q", "F"
        const uploadedFile = req.file;

        // console.log(email, testName, difficulty, testType);

        console.log('Extracting text now...');
        const extractedText = await extractTextFromPDF(uploadedFile); // FUNCTION IMPORTED FROM FILE CONTROLLER

        console.log('Querying chatgpt for test now...');
        const chatgptResponse = await queryChatgptForTest(extractedText, testType, difficulty); // FUNCTION DEFINED ABOVE

        console.log('Questions obtained! Storing them into the database now...');
        const hasBeenStored = await formatAndStoreTest(email, testName, testType, difficulty, chatgptResponse); // FUNCTION DEFINED ABOVE
        
        if (hasBeenStored) {
            const msg = 'Test, questions and options(if any) have been stored in database!';
            console.log(msg)
            res.status(200).json({ message: msg });
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(404).json({ message: error.message });
    }
}

module.exports = { generateAndStoreTest, deleteTest, getTestInfo, getAllQuestionsAndOptionsFromATest };

/*
------------------------------------------------------------------------------------------------------------------------------------
TO TEST THE ABOVE FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/

// To test the insert functions
// formatAndStoreTest('jerricknsc@gmail.com', 'jerrick flashcard', 'F', 'Hard', CHATGPT_response_quiz);


/* Expected Output for testFormatTest():
questionArray =
[ 
    [testID, questionNo, questionText, elaboration],
    [5, 1, 'What is the purpose of the backend in this project?', 'The backend is responsible for providing JSON data to the frontend.'],
    [5, 2, 'Which command is used to install express framework in the backend?', "The command 'npm i express' is used to install the express framework."] ...
]
optionArray =
[
    [ testID, questionNo, optionLetter, optionText, isCorrect ],
    [ 5, 6, 'B', 'Starts the frontend server', false ],
    [ 5, 6, 'C', 'Starts the backend server using nodemon', true ],
    [ 5, 6, 'D', 'Defines the MongoDB path', false ]
  ],
    [ 5, 6, 'A', 'Installs node modules', false ],
    [ 5, 6, 'B', 'Starts the frontend server', false ],
    [ 5, 6, 'C', 'Starts the backend server using nodemon', true ],
    [ 5, 6, 'D', 'Defines the MongoDB path', false ]
  ],
  [
    [ 5, 7, 'A', 'To define the default endpoint', false ],
    [ 5, 7, 'B', 'To return a status code in the response', true ],
    [ 5, 7, 'C', 'To create a new task', false ],
    [ 5, 7, 'D', 'To connect to the database', false ]
  ]

*/

// async function testQueryChatgptForTest(){
//     const testType = 'F';
//     const difficulty = "hard";
//     const result = await queryChatgptForTest(extractedText, testType, difficulty)
    
// }
// testQueryChatgptForTest()

// createNewTest('alice@gmail.com', 'Test1', "F");
// // countTotalNumberOfFlashcardQuestions('isaiah@gmail.com');

// // To test formatAndStoreQuiz function
// async function test() {
//     const result = await formatAndStoreFlashcard('isaiah@gmail.com', 'jp', CHATGPT_response_flashcard);
//     console.log(result);
// }

// test();