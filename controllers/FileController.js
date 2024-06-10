const PDFParser = require("pdf-parse");
const TextStore = require("../models/TextStore");

async function uploadFile(req, res) {
    try {
        console.log("Received a file upload request");
        if (!req.file) {
            console.log("No file uploaded in the request"); // Log if no file is received
            return res.status(400).json({ message: "No file uploaded!" });
        }

        const uploadedFile = req.file;
        const fileBuffer = uploadedFile.buffer;

        console.log("File uploaded:", uploadedFile.originalname); // Log the uploaded file name

        // Process the PDF, store the text in 'convertedText', and optionally log it
        const convertedText = await processPDF(fileBuffer);

        console.log(convertedText); // Log the extracted text for verification
        TextStore.saveText(req.file.originalname, convertedText); // Save text with the filename as key

        return res.status(200).json({
            message: "File successfully uploaded",
            id: req.file.originalname,
        });
    } 
    catch (error) {
        console.error("An error occurred while processing the file:", error);
        return res.status(500).json({ error: "Failed to process the file" });
    }
}

// Helper function
async function processPDF(fileBuffer) {
    try {
        console.log("Processing a PDF file!");

        // Extracting the text from the PDF file
        const data = await PDFParser(fileBuffer);
        return data.text;
    } 
    catch (error) {
        console.error("An error occurred while processing the PDF:", error);
        throw new Error("Failed to process the PDF");
    }
}

module.exports = { uploadFile };