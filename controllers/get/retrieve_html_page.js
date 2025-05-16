const mongoose = require('mongoose');
const PDF = require('../../models/pdf_file');

async function retrieveString(fileId) {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'htmlBucket'
  });
  const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
  return new Promise((resolve, reject) => {
    let data = '';
    downloadStream
      .on('data', chunk => data += chunk.toString())
      .on('error', reject)
      .on('end', () => resolve(data));
  });
}

const retrieve_html_page = async (req, res) => {
  try {
    const { pdfId } = req.params;
    const { page = 1 } = req.query;
    const pageSize = 1;
    
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    // Sort pages by pageNumber
    const sortedPages = pdf.pages.sort((a, b) => a.pageNumber - b.pageNumber);
    
    const startIdx = (page - 1) * pageSize;
    const pagesSubset = sortedPages.slice(startIdx, startIdx + pageSize);

    const htmlContents = await Promise.all(
      pagesSubset.map(async page => ({
        pageNumber: page.pageNumber,
        htmlContent: await retrieveString(page.htmlFile.fileId)
      }))
    );

    res.json({
      pages: htmlContents,
      totalPages: pdf.pages.length,
      currentPage: parseInt(page),
      hasMore: startIdx + pageSize < pdf.pages.length
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving PDF pages',
      error: error.message
    });
  }
};

module.exports = retrieve_html_page;