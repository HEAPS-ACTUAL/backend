const express = require("express");
const cors = require("cors");
const con = require("./models/ConnectionManager");
const queryController = require("./controllers/QueryController");
const saveTextRouter = require("./routers/saveTextRouter"); // Import the saveTextRouter
const fileRouter = require("./routers/FileRouter"); // Import the fileRouter

const app = express(); // Creating an instance of Express
app.use(express.json()); // Telling Express to understand JSON
app.use(cors()); // Enable CORS

const PORT = 8001; // Defining our port as 8001

// Establishing connection with SQL Database
con.connect((error) => {
  if (error) {
    console.log(`ERROR: ${error}`);
  } else {
    console.log("Successfully connected to DB!");
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  return res.status(200).json({ message: "Server is up and running!" });
});

// Routes for user
app.use("/user", require("./routers/UserRouter"));

// Save Text Route for testing
app.use("/save-text", saveTextRouter); // Use the saveTextRouter

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
