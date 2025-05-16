const PDF = require("../../models/pdf_file");

const getAllPDFs = async (req, res) => {
  try {
    const pdfs = await PDF.find({ userId: req.query.userId })
      .sort({ createdAt: -1 });
    
    if (!pdfs.length) {
      return res.status(404).json({ message: 'No PDFs found for this user' });
    }

    // Map through PDFs to restructure the data
    const formattedPDFs = pdfs.map(pdf => {
      const pdfObject = pdf.toObject(); // Convert mongoose document to plain object
      const { pages, ...restOfPDF } = pdfObject; // Destructure to separate pages from rest
      
      return {
        ...restOfPDF,
        cover: pages && pages.length ? pages[0] : "" // Get first page as cover
      };
    });

    res.json(formattedPDFs);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving PDFs',
      error: error.message
    });
  }
};

module.exports = getAllPDFs;