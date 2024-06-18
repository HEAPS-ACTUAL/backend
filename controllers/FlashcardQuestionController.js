const query = require("../utils/PromisifyQuery");

async function addNewFlashcardQuestion(email, fid, questionNo, questionText, answer) {
   
    try {
        // const questionNo = (await countTotalNumberOfFlashcardQuestions(null, null, email, fid)) + 1;
        const sqlQuery = "Insert into Flashcardquestion (UserEmail, fid, QuestionNo, QuestionText, Answer) values (?, ?, ?, ?, ?)";
        const insertOk = await query(sqlQuery, [email, fid, questionNo, questionText, answer]);

        if (insertOk) {
            console.log(`Flashcard Question ${questionNo} added!`);
            // return questionNo;
        }
    } catch (error) {
        const msg = `Error adding Flashcard Question ${questionNo} into database`;
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

async function countTotalNumberOfFlashcardQuestions(req, res, email = null, fid = null) {
    try {
        const sqlQuery = "select count(*) as numOfFlashcardQuestions from flashcardquestion where UserEmail = ? and fid = ?";
        
        if(req && res){
            const email = req.body.email;
            const fid = req.body.fid;
            const returnedData = await query(sqlQuery, [email, fid]);
            const numOfFlashcardQuestions = returnedData[0].numOfFlashcardQuestions;
            return res.status(200).json(numOfFlashcardQuestions);
        }
        else if(email && fid){
            const returnedData = await query(sqlQuery, [email, fid]);
            const numOfFlashcardQuestions = returnedData[0].numOfFlashcardQuestions;
            return numOfFlashcardQuestions;
        }
    } catch (error) {
        console.error(`Error counting number of Flashcard Questions: ${error}`);
    }
}

// To test the functions
// addNewFlashcardQuestion('alice@gmail.com', 1, 'what is sodium chloride?', 'sodium chloride is salt!');
// async function test() {
//     const total = await countTotalNumberOfFlashcardQuestions(null, null, 'isaiah@gmail.com', 1);
//     console.log(`total: ${total}`);
// }
// test();

module.exports = { addNewFlashcardQuestion, countTotalNumberOfFlashcardQuestions };
