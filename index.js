require('dotenv').config(); // MUST BE FIRST LINE TO READ PORT NUMBERS
const express = require("express");
const cors = require("cors"); // to allow secure communication between the frontend and backend.
const {pool} = require("./models/ConnectionManager");

const app = express(); // CREATING AN INSTANCE OF EXPRESS
app.use(express.json()); // TELLING EXPRESS TO UNDERSTAND JSON
app.use(cors()); // IM NOT VERY SURE WHAT THIS DOES LOL, HAVE TO FIND OUT 😅
app.use(express.urlencoded({ extended: true })); // you can parse incoming Request Object if object, with nested objects, or generally any type.

const BE_PORT = Number(process.env.BE_PORT) // Defining our port as 8001

// Establishing connection with SQL Database
connectToSQLDataBase();

// function connectToSQLDataBase() {
//     con.connect((error) => {
//         if (error) {
//             console.log(`DATABASE ERROR: ${error}`);
//             setTimeout(connectToSQLDataBase, 1000);
//         }
//         else {
//             console.log("Successfully connected to DB!");
//         }
//     });

//     con.on('error', (err) => {
//         if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED' || err.code === 'ER_CON_COUNT_ERROR') {
//             connectToSQLDataBase();
//         } else {
//             throw err;
//         }
//     });
// }
function connectToSQLDataBase() {
    pool.on('connection', function (connection) {
    console.log('Successfully connected to DB!');
  
    connection.on('error', function (err) {
      console.error(new Date(), 'MySQL error', err.code);
    });
    connection.on('close', function (err) {
      console.error(new Date(), 'MySQL close', err);
    });
  });
}

// HEALTH CHECK ENDPOINT
app.get("/", (req, res) => {
    return res.status(200).json({ message: "Server is up and running!" });
});

// ROUTES FOR USER
app.use("/user", require("./routers/UserRouter"));

// ROUTES FOR TEST
app.use("/test", require("./routers/TestRouter"));

// ROUTES FOR QUIZ
app.use("/quiz", require("./routers/QuizRouter"));

// ROUTES FOR FLASHCARD
app.use("/flashcard", require("./routers/FlashcardRouter"));

// ROUTES FOR SCHEDULE
app.use("/schedule", require("./routers/ScheduleRouter"));

// ROUTES FOR EMAIL
app.use("/email", require("./routers/EmailRouter"));

// Start server
app.listen(BE_PORT, () => {
    console.log(`Server is listening on port ${BE_PORT}`);
});
