import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker from jsDelivr CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;

/**
 * Extract text content from a PDF file
 * @param {File} file - The PDF file to parse
 * @returns {Promise<string>} - The extracted text content
 */
export async function extractTextFromPdf(file) {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer 
    }).promise;
    
    // Extract text from each page
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Join all text items with spaces
      const pageText = content.items.map(item => item.str).join(" ");
      text += pageText + "\n";
    }
    
    return text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    // Return a placeholder text if PDF parsing fails
    return "PDF content could not be extracted. Please try uploading a different PDF file.";
  }
}
