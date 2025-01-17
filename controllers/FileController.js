const PDFParser = require("pdf-parse");

async function extractTextFromPDF(uploadedFile) {
    try {
        // const fileName = uploadedFile.originalname
        const fileBuffer = uploadedFile.buffer;

        // Extract the text from PDF
        const PDFData = await PDFParser(fileBuffer);
        const extractedText = PDFData.text

        return extractedText;
    } 
    catch (error) {
        const msg = `An error occurred while extracting the text from the PDF`
        console.error(`${msg}: ${error.message}`);
        throw new Error(msg);
    }
}

module.exports = { extractTextFromPDF };