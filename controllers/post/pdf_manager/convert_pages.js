const path = require('path');
const PdfConverter = require('../../../func/pdf_converter');
const ConversionError = require('../../../utils/conversion_error');
const fs = require('fs');

const { uid } = require('uid');
const { default: mongoose } = require('mongoose');
const PDF = require('../../../models/pdf_file');
const fsPromises = require('fs').promises; // Keep this for other async operations


const handleUpload = async (filePath, originalFilename, mimetype, bucket) => {
  try {
    // Use the regular fs for creating read streams
    const fileStream = fs.createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(originalFilename, {
        contentType: mimetype
      });

      fileStream.on('error', (error) => {
        reject(new Error(`Error reading file: ${error.message}`));
      });

      fileStream.pipe(uploadStream);

      uploadStream.on('error', (error) => {
        reject(new Error(`Error uploading to GridFS: ${error.message}`));
      });

      uploadStream.on('finish', () => {
        resolve(uploadStream.id);
      });
    });
  } catch (error) {
    throw new Error(`Failed to handle file upload: ${error.message}`);
  }
};
// Get PDF page count
async function getPdfPageCount(inputPath) {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync(`pdfinfo "${inputPath}" | grep Pages:`);
    return parseInt(stdout.split(':')[1]);
  } catch (error) {
    throw new ConversionError('Failed to get PDF page count: ' + error.message);
  }
}

// Clean up files
async function cleanupFiles(files) {
  for (const file of files) {
    try {
      await fsPromises.unlink(file);
    } catch (error) {
      console.error(`Error cleaning up file ${file}:`, error);
    }
  }
}



const convert_pages = async (req, res) => {
  const userId = req.body.userId

  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }


  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "filesBucket",
  });

  const jobId = `pdf-${uid(9)}`;
  const inputPath = path.resolve(req.file.path);
  const filesToCleanup = [inputPath];

  try {
    const totalPages = await getPdfPageCount(inputPath);

    const uploadedPDF = await handleUpload(
      inputPath,
      req.file.originalname,
      req.file.mimetype,
      bucket
    );

    const myPDF = new PDF({
      jobId: jobId,
      userId,
      originalFilename: req.file.originalname,
      totalPages: totalPages,
      convertedPages: 0,
      status: 'uploading',
      pdfFile: {
        filename: req.file.filename,
        fileId: uploadedPDF,
      }
    })

    await myPDF.save()

    try {
      
      const pageRange = Array.from({ length: totalPages }, (_, i) => i + 1);

      const converter = new PdfConverter({
        myPDF,
        jobId,
        userId,
        socket: req.io.socket,
        onProgress: ({ completed, total, percentage }) => {
          console.log(`Converting pages: ${completed}/${total} (${percentage}%)`);
        }
      });

      const pages = await converter.convertPages(inputPath, pageRange);
      myPDF.status = "completed";
      myPDF.convertedPages = Object.keys(pages).length;
      myPDF.completionTime = Date.now();

      await myPDF.save();

      res.json({
        success: true,
        jobId,
        totalPages,
        convertedPages: Object.keys(pages).length,
        pdfId: myPDF.id
      });
    } catch (error) {
      // Emit error status
      req.io.socket.emit('conversion_status', {
        status: 'error',
        jobId,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.error('Conversion failed:', error);
      res.status(error.statusCode || 500).json({
        error: 'Conversion failed',
        details: error.message
      });
    } finally {
      await cleanupFiles(filesToCleanup);
    }
  } catch (err) {

    throw new Error(err)
  }

};


module.exports = convert_pages;