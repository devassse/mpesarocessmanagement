const axios = require('axios');
const PDF_SERVER_URL = process.env.PDF_SERVER_URL || 'http://localhost:4000';

const redirectGetSinglePDF = async (req, res) => {
  try {
    const response = await axios.get(`${PDF_SERVER_URL}/get/get-single-pdf/${req.params.id}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({
      error: 'Failed to retrieve PDF',
      details: error.message
    });
  }
};

module.exports = redirectGetSinglePDF;