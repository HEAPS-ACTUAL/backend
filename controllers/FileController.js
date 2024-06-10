const PDFParser = require("pdf-parse");
const TextStore = require("../models/TextStore");
const con = require("../models/ConnectionManager");

async function extractTextFromPDF(req, res) {
    try {
        // console.log("Received a file upload request");
        console.log(req);

        if (!req.file) {
            console.log("No file uploaded in the request"); // Log if no file is received
            return res.status(404).json({ message: "No file uploaded!" });
        }

        const uploadedFile = req.file;

        const fileName = uploadedFile.originalname
        const fileBuffer = uploadedFile.buffer;

        // console.log("File uploaded:", fileName); // Log the uploaded file name

        // Process the PDF, store the text in 'convertedText', and optionally log it
        const PDFData = await PDFParser(fileBuffer);
        const extractedText = PDFData.text

        // console.log(convertedText); // Log the extracted text for verification
        // TextStore.saveText(req.file.originalname, convertedText); // Save text with the filename as key
        
        // res.status(200).json({
        //     message: "File successfully uploaded",
        //     fileName: fileName,
        //     extractedText: extractedText
        // });

        return extractedText;
    } 
    catch (error) {
        console.error("An error occurred while processing the file:", error);
        return res.status(500).json({ error: "Failed to process the file" });
    }
}

// Helper function
// async function processPDF(fileBuffer) {
//     try {
//         console.log("Processing a PDF file!");

//         // Extracting the text from the PDF file
//         const data = await PDFParser(fileBuffer);
//         return data.text;
//     } 
//     catch (error) {
//         console.error("An error occurred while processing the PDF:", error);
//         throw new Error("Failed to process the PDF");
//     }
// }

module.exports = { extractTextFromPDF };