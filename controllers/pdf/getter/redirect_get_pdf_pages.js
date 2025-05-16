const axios = require('axios');
const PDF_SERVER_URL = process.env.PDF_SERVER_URL || 'http://localhost:4000';

const redirectGetPDFPages = async (req, res) => {
  try {
    const response = await axios.get(
      `${PDF_SERVER_URL}/get/pdf-pages/${req.params.pdfId}`, {
        params: { page: req.query.page },
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({
      error: 'Failed to retrieve PDF pages',
      details: error.message
    });
  }
};

module.exports = redirectGetPDFPages;