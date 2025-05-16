const axios = require('axios');
const FormData = require('form-data');

// Configure the target server URL
const PDF_SERVER_URL = process.env.PDF_SERVER_URL || 'http://localhost:4000';

const redirectSignatureUpdate = async (req, res) => {
  console.log(req.file) // Log the single file object
  
  try {
    // Ensure we have the signature file and user
    if (!req.file) {
      return res.status(400).json({ error: 'No signature file uploaded' });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const pdfId = req.params.pdfId;

    // Create form data for the request
    const formData = new FormData();
    formData.append('signature', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    formData.append('userId', req.user.id);

    // Forward the request to the PDF server
    const response = await axios.put(`${PDF_SERVER_URL}/update/${pdfId}/signature`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': req.headers.authorization // Forward auth header if needed
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    // Return the PDF server's response to the client
    return res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Error redirecting to PDF server:', error);
    
    // If the error is from the PDF server, forward its response
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    // Otherwise return a generic error
    return res.status(500).json({
      error: 'Failed to update signature',
      message: error.message
    });
  }
};

module.exports = redirectSignatureUpdate;