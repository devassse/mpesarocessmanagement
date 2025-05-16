const PDF = require("../../models/pdf_file");


const getSinglePDF = async (req, res) => {
  try {
    const pdf = await PDF.findById(req.params.id)
      .select('-pages');
    
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.json(pdf);
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving PDF',
      error: error.message
    });
  }
};

module.exports = getSinglePDF;