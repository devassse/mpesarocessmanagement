
const GridFSStringService = require('../../utils/string_ops');

const getCoverHTML = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        message: 'File ID is required'
      });
    }

    // Retrieve HTML content from GridFS
    const htmlContent = await GridFSStringService.retrieveString(fileId);

    if (!htmlContent) {
      return res.status(404).json({
        message: 'Cover HTML not found'
      });
    }

    // Set appropriate headers for HTML content
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);

  } catch (error) {
    // Handle specific MongoDB ObjectID errors
    if (error.name === 'CastError' || error.name === 'BSONError') {
      return res.status(400).json({
        message: 'Invalid file ID format'
      });
    }

    console.error('Error retrieving cover HTML:', error);
    res.status(500).json({
      message: 'Error retrieving cover HTML',
      error: error.message
    });
  }
};


module.exports = getCoverHTML