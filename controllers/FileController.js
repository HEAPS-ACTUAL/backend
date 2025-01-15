const PDFParser = require("pdf-parse");
const pdfjs = require("pdfjs-dist/build/pdf.min.js");

// Disable worker for Node (server) usage
pdfjs.GlobalWorkerOptions.workerSrc = "";

async function extractTextFromPDF(uploadedFile, selectedPages) {
  try {
    let uploadedFileBuffer = new Uint8Array(uploadedFile.buffer);

    // console.log(uploadedFileBuffer);
    const loadingTask = pdfjs.getDocument({ data: uploadedFileBuffer });
    const pdfDocument = await loadingTask.promise;

    // Extract text from the selected pages
    const extractedText = [];
    for (let pageIndex of selectedPages) {
      // Validate
      pageIndex = pageIndex + 1; // because the index started from 0
      if (pageIndex < 1 || pageIndex > pdfDocument.numPages) {
        throw new Error(`Page number ${pageIndex} is out of bounds.`);
      }

      // Get the page
      const page = await pdfDocument.getPage(pageIndex);
      // Extract text content
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      // Push into results array
      extractedText.push(`Page ${pageIndex}:\n${pageText}`);
    }
    // Join results
    // console.log(extractedText);
    return extractedText.join("\n\n");
  } catch (error) {
    console.error(`PDF extraction error: ${error.message}`);
    throw new Error("An error occurred while extracting the text from the PDF");
  }
}

module.exports = { extractTextFromPDF };
