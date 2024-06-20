// MODULES
const query = require('../utils/PromisifyQuery');
const openAI = require('openai');
require('dotenv').config(); // { path: '../.env' } this makes .env undetected for some reason

// FUNCTIONS AND VARIABLES
const { extractTextFromPDF } = require("./FileController");
const { addNewQuestion } = require('./QuestionController');
const { addNewFlashcardQuestion } = require('./FlashcardQuestionController');
const { options } = require('../routers/SampleQuestionRouter');
/*
------------------------------------------------------------------------------------------------------------------------------------
SQL DATABASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/
async function storeNewTest(email, testName, testType) {
    try {
        const testID = await determineTheNextTestID(email); // FUNCTION DEFINED BELOW
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

async function determineTheNextTestID(email) {
    try {
        const sqlQuery = 'Select testID from Test where email = ? order by testID desc limit 1';
        const returnedData = await query(sqlQuery, [email]);
        if (returnedData.length == 0) {
            return 1; // IF NO Test HAS BEEN CREATED BEFORE, USE NUMBER 1 AS THE NEXT Test ID
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
    const email = req.body.email;
    const testID = req.body.testID;
    const testName = req.body.testName;

    try {
        const sqlQuery = 'Delete from Test where email = ? and testID = ?';
        const deleteOk = await query(sqlQuery, [email, testID]);
        res.status(200).json({ message: `${testName} has been deleted!` });
    }
    catch (error) {
        console.log(`Could not delete ${testName} due to the following error: ${error}`);
        res.status(404).json({ message: `Could not delete ${testName}!` });
    }
}

/*
------------------------------------------------------------------------------------------------------------------------------------
THESE ARE JUST HELPER FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/

async function queryChatgptForTest(extractedText, testType, difficulty) {
    const chatgpt = new openAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = await getPrompt(testType, difficulty, numOfQuestions=12); // contains key-value for appropriate Test prompt
    // console.log(prompt);
    try {
        const query =
            `${extractedText} \n\n` + prompt;
        
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
        const msg = `An error occurred while generating the Test questions`
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

async function getPrompt(testType, difficulty, numOfQuestions=12){
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

async function formatAndStoreTest(email, testName, testType, chatgpt_response) {
     
    try {
        const testID = await storeNewTest(email, testName, testType);
        if (!testID) { return 'Could not store Test!'; }

        let array_of_question_obj_strings = chatgpt_response.split('|||').slice(0, -1); // slice to remove last element of array because it is just an empty string
        // console.log(array_of_question_obj_strings);

        for (let question_obj_string of array_of_question_obj_strings) {
            let question_obj = JSON.parse(question_obj_string); // this converts a string into a JSON
            
            const questionNo = question_obj["QuestionNumber"];
            const questionText = question_obj['ActualQuestion'];
            const elaboration = question_obj['Elaboration'];

            await addNewQuestion(testID, questionNo, questionText, elaboration); // FUNCTION IMPORTED FROM Test QUESTION CONTROLLER    
        }

        const everythingOk = true;
        return everythingOk;
    }
    catch (error) {
        throw new Error(`Error Test adding into database: ${error.message}`);
    }
}

async function formatTest(email, testName, testType, chatgpt_response){
    try {
        const testID = await storeNewTest(email, testName, testType);
        if (!testID) { return 'Could not store Test!'; }

        
        let array_of_question_obj_strings = chatgpt_response.split('|||').slice(0, -1); // slice to remove last element of array because it is just an empty string
        // console.log(array_of_question_obj_strings);
        const [questionArray, optionArray] = await formatQuestionsAndOptions(array_of_question_obj_strings, testID, testType);
        // UNFINISHED, need to think of how to not return two arrays..

        // console.log(questionArray);
        // console.log(optionArray);
        // PICK UP FROM HERE, RUN W testFormatTest() below to see output

        const everythingOk = true;
        return everythingOk;
    }
    catch (error) {
        throw new Error(`Error Test adding into database: ${error.message}`);
    }
}

async function formatQuestionsAndOptions(array_of_question_obj_strings, testID,testType ){
    try{
        let questionArray = [];
        let allOptionsArray = [];
        const quiz='Q';

        for (let question_obj_string of array_of_question_obj_strings) {
            let question_obj = JSON.parse(question_obj_string); // this converts a string into a JSON
            const questionNo = question_obj["QuestionNumber"];
            const questionText = question_obj['ActualQuestion'];
            const elaboration = question_obj['Elaboration'];
            questionArray.push([testID, questionNo, questionText, elaboration]);
            
            if (testType === quiz){
                const array_of_option_objects = question_obj['Options'];
                allOptionsArray.push(await getOptionsArray(array_of_option_objects, testID, questionNo));
            
            }
        }
        // console.log(questionArray)
        // console.log(optionArray)
        return [questionArray, allOptionsArray]; // I don't like that its returning two arrays, but im tired its 1.58am LOL

    }catch(error){
        throw new Error(`${error.message}`);
    }
}

async function getOptionsArray(array_of_option_objects, testID, questionNo){
    try{
        const optionArray = [];
        const optionDict = {
            0: 'A', 
            1: 'B', 
            2: 'C',
            3: 'D'
        };
        let curCount = -1;
        for (let option_obj of array_of_option_objects) {
            curCount ++;
            const optionText = option_obj['Option'];
            const isCorrect = option_obj['IsCorrect?'];
            const optionLetter = optionDict[curCount];
            optionArray.push([testID, questionNo, optionLetter, optionText, isCorrect]);
        }
        return optionArray;

    } catch(error){
        throw new Error(`${error.message}`);
    }
}

/*
------------------------------------------------------------------------------------------------------------------------------------
THIS FUNCTION WILL BE CALLED WHEN USER CLICKS 'GENERATE QUIZ' ON THE FRONTEND
------------------------------------------------------------------------------------------------------------------------------------
*/
async function generateAndStoreTest(req, res) {
    try {
        // CHECK WHETHER USER PRESSES GENERATE Test WITHOUT UPLOADING ANYTHING
        if (!req.file) {
            res.status(404).json({ message: "No file uploaded!" });
            throw new Error("No file uploaded");
        }

        const email = req.body.email; // string
        const testName = req.body.testName; // string
        const difficulty = req.body.difficulty; // single str ch: "E","M","H"
        const testType = req.testType; // single str ch: "Q", "F"
        const uploadedFile = req.file;

        // console.log(email, testName, difficulty);

        console.log('Extracting text now...');
        const extractedText = await extractTextFromPDF(uploadedFile); // FUNCTION IMPORTED FROM FILE CONTROLLER

        console.log('Querying chatgpt for Test now...');
        const chatgptResponse = await queryChatgptForTest(extractedText, testType, difficulty); // FUNCTION DEFINED ABOVE

        console.log('Questions obtained! Storing them into the database now...');
        const hasBeenStored = await formatAndStoreTest(email, testName,testType, chatgptResponse); // FUNCTION DEFINED ABOVE

        if (hasBeenStored) {
            const msg = 'Test, questions and answers have been stored in database!';
            console.log(msg)
            res.status(200).json({ message: msg });
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(404).json({ message: error.message });
    }
}

module.exports = { generateAndStoreTest };
// console.log(queryChatgpt(extractedText)); // for testing

/*
------------------------------------------------------------------------------------------------------------------------------------
TO TEST THE ABOVE FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/

// To test the insert functions
// const extractedText = require("../test_ISAIAH/testpdf");
// const CHATGPT_response_flashcard = require("../test_ISAIAH/test_GPT_response"); 
const CHATGPT_response_quiz = require('../JERRICK TEST (ill delete this after awhile)/temporary');

async function testFormatTest(){
    const result = await formatTest("alice@gmail.com", "Isaiah Test", 'Q', CHATGPT_response_quiz)
    
}
testFormatTest()

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
