const query = require('../utils/PromisifyQuery');

async function addAllOptionsForAQuiz(arrayOfValues){
    try{
        const sqlQuery = 'Insert into `option` (TestID, QuestionNo, OptionLetter, OptionText, IsCorrect) values ?';
        const insertOk = await query(sqlQuery, [arrayOfValues]);
        
        if(insertOk.affectedRows === arrayOfValues.length){
            console.log('All options for this quiz has been inserted!');
        }
        else{
            console.log('Not all options have been inserted!');
        }
    }
    catch(error){
        const msg = `Error adding options into database`;
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

async function addNewOption(email, quizID, questionNo, optionText, isCorrect){
    try{
        const optionDict = {
            1: 'A', 
            2: 'B', 
            3: 'C',
            4: 'D'
        };
    
        const numOfOptions = await countTotalNumberOfOptions(email, quizID, questionNo);
        
        if(numOfOptions == 4){
            const msg = `Error adding option for (${email}, ${quizID}, ${questionNo}): This question already has 4 options!`
            console.error(msg);
            throw new Error(msg);
        }
        
        const currentOption = optionDict[numOfOptions + 1];        
        const sqlQuery = 'Insert into `Option` (UserEmail, QuizID, QuestionNo, OptionLetter, OptionText, IsCorrect) values (?, ?, ?, ?, ?, ?)';

        try{
            const insertOk = await query(sqlQuery, [email, quizID, questionNo, currentOption, optionText, isCorrect]);
            console.log(`Option ${currentOption} added!`);
            return insertOk;
        }
        catch(error){
            const msg = `Error adding option ${currentOption} into database`;
            console.error(`${msg}: ${error.msg}`);
            throw error
        }
    }
    catch(error){
        throw new Error(`${error.message}`);
    }
}

async function countTotalNumberOfOptions(email, quizID, questionNo){
    try{
        const sqlQuery = 'select count(*) as numOfOptions from `Option` where UserEmail = ? and QuizID = ? and QuestionNo = ?';
        const returnedData = await query(sqlQuery, [email, quizID, questionNo]);
        const numOfOptions = returnedData[0].numOfOptions;
        // console.log(numOfOptions);

        return (numOfOptions);
    }
    catch(error){
        console.log(`Error counting number of options: ${error}`)
    }
}

async function getAllOptionsForAQuestion(email, quizID, questionNo){
    try{
        const sqlQuery = 'Select QuestionNo, OptionLetter, OptionText, IsCorrect from `option` where UserEmail = ? and QuizID = ? and QuestionNo = ?';
        const returnedData = await query(sqlQuery, [email, quizID, questionNo]);
        
        // console.log(returnedData);
    }
    catch(error){
        console.log(`Error: ${error}`)
    }
}

// To test the functions
// addNewOption('alice@gmail.com', 1, 1, 'salt', true);
// addNewOption('alice@gmail.com', 1, 1, 'diamond', false);
// addNewOption('alice@gmail.com', 1, 1, 'pepper', false);
// addNewOption('alice@gmail.com', 1, 1, 'brains', false);
// addNewOption('alice@gmail.com', 1, 1, 'spoon', false);
// getAllOptionsForAQuestion('jerricknsc@gmail.com', 1, 1);

module.exports = {addAllOptionsForAQuiz};