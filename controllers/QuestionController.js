const query = require("../utils/PromisifyQuery");

/*
------------------------------------------------------------------------------------------------------------------------------------
SQL DATABASE RELATED FUNCTIONS
------------------------------------------------------------------------------------------------------------------------------------
*/

async function addAllQuestionsForATest(arrayOfValues){
    try{
        const sqlQuery = "Insert into question (TestID, QuestionNo, QuestionText, Elaboration) values ?";
        const insertOk = await query(sqlQuery, [arrayOfValues]);
        
        if(insertOk.affectedRows === arrayOfValues.length){
            console.log('All questions for this quiz has been inserted!');
        }
        else{
            console.log('Not all questions have been inserted!');
        }
    }
    catch(error){
        const msg = `Error adding questions into database`;
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

async function countTotalNumberOfQuestions(req, res, quizID = null) {
    try {
        const sqlQuery = "select count(*) as numOfQuestions from question where TestID = ?";
        
        if(req && res){
            const testID = req.body.testID;
            const returnedData = await query(sqlQuery, [testID]);
            const numOfQuestions = returnedData[0].numOfQuestions;
            return res.status(200).json(numOfQuestions);
        }
        else if(testID){
            const returnedData = await query(sqlQuery, [testID]);
            const numOfQuestions = returnedData[0].numOfQuestions;
            return numOfQuestions;
        }
    } catch (error) {
        console.error(`Error counting number of questions: ${error}`);
    }
}

async function getLastTwoQuestions(testID) {
    try {
        const sqlQuery = `
            SELECT *
            FROM Question
            WHERE TestID = ?
            ORDER BY QuestionNo DESC
            LIMIT 2;
        `;
        const results = await query(sqlQuery, [testID]);
        return results.reverse(); // Reverse to maintain the order of insertion when displaying
    }
    catch (error) {
        console.error("Error fetching the last two questions:", error);
        throw error;
    }
}

async function getAllQuestionsAndOptionsFromAQuiz(req, res){
    const quizID = req.body.quizID;
    // const quizID = 1;

    try{
        const sqlQuery = 'Select q.QuestionNo, q.QuestionText, q.Elaboration, o.OptionLetter, o.OptionText, o.IsCorrect from question q, `option` o where (q.UserEmail = o.UserEmail) and (q.QuizID = o.QuizID) and (q.QuestionNo = o.QuestionNo) and (q.UserEmail = ?) and (q.QuizID = ?)';
        const returnedData = await query(sqlQuery, [email, quizID]);

        const questionsOfThisUser = await restructureQuestionsAndOptions(email, quizID, returnedData);

        res.status(200).json(questionsOfThisUser);
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

async function restructureQuestionsAndOptions(email, quizID, responseFromDatabase){
    const questionsOfThisUser = 
    {
        email: email, 
        quizID: quizID,
        questions: []
    }

    let optionsArray = [];

    for(let i = 0; i < responseFromDatabase.length; i += 1){        
        let row = responseFromDatabase[i];
        
        optionsArray.push(
            {
                letter: row.OptionLetter,
                text: row.OptionText,
                isCorrect: row.IsCorrect
            }
        )

        if((i+1) % 4 == 0 && i != 0){
            questionsOfThisUser['questions'].push(
                {
                    number: row.QuestionNo, 
                    text: row.QuestionText, 
                    elaboration: row.Elaboration,
                    options: optionsArray
                });
            
            // console.log(optionsArray);
            optionsArray = [];
        }
    }
    
    // console.log(questionsOfThisUser);
    return questionsOfThisUser;
}

// To test the functions
// createNewQuestion('alice@gmail.com', 1, 'what is sodium chloride?', 'sodium chloride is salt!');
// getAllQuestionsAndOptionsFromAQuiz('jerricknsc@gmail.com', 1);

module.exports = { addNewQuestion, getLastTwoQuestions, countTotalNumberOfQuestions, getAllQuestionsAndOptionsFromAQuiz };
