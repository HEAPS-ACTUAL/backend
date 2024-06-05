const fileUpload = require("express-fileupload");
const PDFParser = require("pdf-parse");
const multer = require('multer');
const pdf = require('html-pdf');

async function uploadFile(req, res){
    try {
        console.log('Received a file upload request');
        if (!req.file){
            return res.status(400).json({message: "No file uploaded!"});
        }
         
        const uploadedFile = req.file;
        const fileBuffer = uploadedFile.buffer
        // console.log(uploadedFile);

        processPDF(fileBuffer);
        // console.log(pdfParse(req.files.pdfFile)); // testing pdf to text conversion
        return res.status(200).json({message: "File successfully uploaded"});  
    } 
    catch(error) {
        console.error('An error occurred while processing the file:', error);
        res.status(500).json({ error: 'Failed to process the file' });
    }
   
}

// Helper function
async function processPDF(fileBuffer) {
    try {
        console.log("Processing a PDF file!")
        // Parse the PDF content
        const data = await PDFParser(fileBuffer);
        const pdfText = data.text;
        console.log(pdfText);
    } 
    catch (error){
        console.error('An error occurred while processing the PDF:', error);
        res.status(500).json({ error: 'Failed to process the PDF' });
    }
}

module.exports = {uploadFile};