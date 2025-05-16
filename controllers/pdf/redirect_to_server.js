const axios = require('axios');
const FormData = require('form-data');

// Configure the target server URL
const PDF_SERVER_URL = process.env.PDF_SERVER_URL || 'http://localhost:4000';

const redirectserver = async (req, res) => {
    try {
        // Ensure we have the PDF files and user
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Get the first file since we limited to 1
        const pdfFile = req.files[0];

        // Create form data for the request
        const formData = new FormData();
        formData.append('pdf', pdfFile.buffer, {
            filename: pdfFile.originalname,
            contentType: pdfFile.mimetype
        });
        formData.append('userId', req.user.id);

        console.log("passed")

        // Forward the request to the PDF server
        const response = await axios.post(`${PDF_SERVER_URL}/convert-pages`, formData, {
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
            error: 'Failed to process PDF',
            message: error.message
        });
    }
};

module.exports = redirectserver;