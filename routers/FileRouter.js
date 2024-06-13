/*
This file is in charge of determining which functions from FileController.js to 
execute based on the endpoint of the request that is being sent.
*/
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { extractTextFromPDF } = require("../controllers/FileController");

// Set up multer for in-memory file uploads
const storage = multer.memoryStorage(); // creates a buffer storage
const upload = multer({ storage: storage });

// Function to handle the response after text extraction
const handlePDFUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    // Extract text from PDF
    const extractedText = await extractTextFromPDF(req.file);
    res.status(200).json({ text: extractedText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPLOAD PDF BY USER
router.post("/upload", upload.single("file"), handlePDFUpload);

module.exports = router;
