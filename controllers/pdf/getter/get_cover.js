const axios = require('axios');
const PDF_SERVER_URL = process.env.PDF_SERVER_URL || 'http://localhost:4000';

const redirectGetCover = async (req, res) => {
 try {
   const response = await axios.get(`${PDF_SERVER_URL}/get/cover/${req.params.fileId}`, {
     headers: {
       'Authorization': req.headers.authorization
     }
   });
   res.setHeader('Content-Type', 'text/html');
   return res.send(response.data);
 } catch (error) {
   if (error.response) {
     return res.status(error.response.status).json(error.response.data);
   }
   return res.status(500).json({
     error: 'Failed to retrieve cover HTML',
     details: error.message
   });
 }
};

module.exports = redirectGetCover;