const express = require("express");
const cors = require("cors");
const con = require("./models/ConnectionManager");
const queryController = require("./controllers/QueryController");
const fileRouter = require("./routers/FileRouter"); // Import the fileRouter

const app = express(); // CREATING AN INSTANCE OF EXPRESS
app.use(express.json()); // TELLING EXPRESS TO UNDERSTAND JSON
app.use(cors()); // IM NOT VERY SURE WHAT THIS DOES LOL, HAVE TO FIND OUT 😅
app.use(express.urlencoded({ extended: true })); // you can parse incoming Request Object if object, with nested objects, or generally any type.

const PORT = 8001; // Defining our port as 8001

// Establishing connection with SQL Database
con.connect((error) => {
  if (error) {
    console.log(`ERROR: ${error}`);
  } else {
    console.log("Successfully connected to DB!");
  }
});

// HEALTH CHECK ENDPOINT
app.get('/', (req, res) => {
    return res.status(200).json({message: "Server is up and running!"});
})

// ROUTES FOR USER
app.use('/user', require('./routers/UserRouter'));

// ROUTES FOR FILE
app.use('/file', require('./routers/FileRouter'));

// File upload route
app.use("/file", fileRouter); // Use the fileRouter for file upload

// Query Route
app.post("/query", (req, res) => {
  queryController.handleQuery(req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
