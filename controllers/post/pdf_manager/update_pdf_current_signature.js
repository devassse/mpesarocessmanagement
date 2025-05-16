const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Readable } = require('stream');
const PDF = require('../../../models/pdf_file');

// Create a separate bucket for images
const createImageStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

const GridFSImageService = {
  async storeImage(buffer, filename, metadata = {}) {
    try {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'signatureImages'
      });
      
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: metadata
      });

      return new Promise((resolve, reject) => {
        const readableStream = createImageStream(buffer);
        readableStream.pipe(uploadStream);
        
        uploadStream.on('finish', () => {
          resolve({
            fileId: uploadStream.id,
            size: uploadStream.length
          });
        });
        
        uploadStream.on('error', error => reject(error));
      });
    } catch (error) {
      throw error;
    }
  }
};

// Update signature endpoint
const updateCurrentUserPDFImage = async (req, res) => {

  console.log("passed", console.log(req.file))
  
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No signature file provided'
      });
    }

    const pdfId = req.params.pdfId;

    // Validate PDF exists
    const pdf = await PDF.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    // Delete old signature file if it exists
    if (pdf.currentUserSignature && pdf.currentUserSignature.fileId) {
      const oldBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'signatureImages'
      });
      try {
        await oldBucket.delete(pdf.currentUserSignature.fileId);
      } catch (error) {
        console.error('Error deleting old signature:', error);
        // Continue execution even if delete fails
      }
    }

    // Store new signature
    const { fileId, size } = await GridFSImageService.storeImage(
      req.file.buffer,
      `signature_${pdfId}_${Date.now()}`,
      {
        contentType: req.file.mimetype,
        pdfId: pdfId
      }
    );

    // Update PDF document with new signature
    const updatedPdf = await PDF.findByIdAndUpdate(
      pdfId,
      {
        currentUserSignature: {
          fileId: fileId,
          size: size
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Signature updated successfully',
      data: {
        pdfId: updatedPdf._id,
        signature: updatedPdf.currentUserSignature
      }
    });

  } catch (error) {
    console.error('Error updating signature:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating signature',
      error: error.message
    });
  }
};

module.exports = updateCurrentUserPDFImage;