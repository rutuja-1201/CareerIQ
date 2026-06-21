import pdfParse from 'pdf-parse';

export const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    if (!text || text.length < 50) {
      console.warn('PDF text extraction resulted in very short or empty text');
      return null;
    }

    return text;
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    throw new Error('Failed to parse PDF file. Please ensure it is a valid PDF document.');
  }
};
