const query = require('../utils/Promisify');

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
            console.log(`Error adding option for (${email}, ${quizID}, ${questionNo}): This question already has 4 options!`);
            return;
        }
        
        const currentOption = optionDict[numOfOptions + 1];        
        const sqlQuery = 'Insert into `Option` (UserEmail, QuizID, QuestionNo, OptionLetter, OptionText, IsCorrect) values (?, ?, ?, ?, ?, ?)';
        const insertOk = await query(sqlQuery, [email, quizID, questionNo, currentOption, optionText, isCorrect]);

        if (insertOk){
            console.log(`Option ${currentOption} added!`);
            return insertOk;
        }
    }
    catch(error){
        console.log(`Error adding option into database: ${error}`)
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

async function retrieveAllOptions(){
    try{
        const sqlQuery = 'select * from `Option`';
        const returnedData = await query(sqlQuery);
        
        console.log(returnedData);
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

module.exports = {addNewOption};