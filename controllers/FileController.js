const PDFParser = require("pdf-parse");

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
        return res.status(500).json({ error: 'Failed to process the file' });
    }
} 

// Helper function
async function processPDF(fileBuffer) {
    try {
        console.log("Processing a PDF file!")

        // Extracting the text from the PDF file
        const data = await PDFParser(fileBuffer);
        const pdfText = data.text;
        console.log(pdfText);
    } 
    catch (error){
        console.error('An error occurred while processing the PDF:', error);
        return res.status(500).json({ error: 'Failed to process the PDF' });
    }
}

module.exports = {uploadFile};