// faceRedirect.js
const axios = require('axios');
const FormData = require('form-data');

const FACE_SERVER_URL = process.env.FACE_SERVER_URL || 'http://localhost:5500';

const redirectCompareFaces = async (req, res) => {
    try {

        // Verify two files are uploaded
        if (!req.files || req.files.length !== 2) {
            return res.status(400).json({ error: 'Exactly two images required' });
        }

        console.log("Face Recog")

        // Extract images from request
        const [image1, image2] = req.files;

        // Prepare form data for forwarding
        const formData = new FormData();
        formData.append('image1', image1.buffer, {
            filename: image1.originalname,
            contentType: image1.mimetype
        });
        formData.append('image2', image2.buffer, {
            filename: image2.originalname,
            contentType: image2.mimetype
        });

        // Forward request to face comparison service
        const response = await axios.post(`${FACE_SERVER_URL}/compare_faces`, formData, {
            headers: {
                ...formData.getHeaders(),
            }
        });


        // Return response to client
        return res.status(response.status).json(response.data);

    } catch (error) {
        console.error('Face comparison redirect error:', error);
        
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        
        return res.status(500).json({
            error: 'Face comparison failed',
            message: error.message
        });
    }
};

module.exports = redirectCompareFaces;