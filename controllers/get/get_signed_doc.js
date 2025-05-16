const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { PDFDocument } = require('pdf-lib');
const PDF = require('../../models/pdf_file');
const { Readable } = require('stream');

/**
 * Creates a readable stream from a buffer
 * @param {Buffer} buffer - The buffer to stream
 * @returns {Readable} - The readable stream
 */
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

/**
 * Retrieves file from GridFS with enhanced error checking
 * @param {ObjectId} fileId - The GridFS file ID
 * @param {string} bucketName - The name of the GridFS bucket
 * @returns {Promise<Buffer>} - The file buffer
 */
async function getFileFromGrid(fileId, bucketName) {
  try {
    if (!fileId) {
      throw new Error('FileId is required');
    }

    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
    
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: bucketName
    });

    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      throw new Error(`No file found with id ${fileId} in bucket ${bucketName}`);
    }

    console.log('Found file metadata:', {
      filename: files[0].filename,
      length: files[0].length,
      uploadDate: files[0].uploadDate
    });

    return new Promise((resolve, reject) => {
      const chunks = [];
      let totalLength = 0;
      
      const downloadStream = bucket.openDownloadStream(objectId);
      
      downloadStream.on('data', chunk => {
        chunks.push(chunk);
        totalLength += chunk.length;
      });
      
      downloadStream.on('error', error => {
        console.error('Download stream error:', error);
        reject(error);
      });
      
      downloadStream.on('end', () => {
        const buffer = Buffer.concat(chunks, totalLength);
        if (buffer.length === 0) {
          reject(new Error('Retrieved empty buffer from GridFS'));
        } else {
          resolve(buffer);
        }
      });
    });
  } catch (error) {
    console.error('Error in getFileFromGrid:', error);
    throw error;
  }
}

/**
 * Converts percentage coordinates to PDF page coordinates
 * @param {number} x - X percentage (0-100)
 * @param {number} y - Y percentage (0-100)
 * @param {Object} pageSize - PDF page dimensions
 * @returns {Object} - Actual coordinates
 */
function convertPercentageToCoordinates(x, y, pageSize) {
  const { width, height } = pageSize;
  return {
    x: (x / 100) * width,
    y: height - ((y / 100) * height)
  };
}

/**
 * Handle PDF signature placement and return modified PDF
 */
async function handlePDFSignature(req, res) {
  try {
    const { _id } = req.params;
    const MAX_SIGNATURE_HEIGHT = 70; // Maximum signature height in points
    
    const pdfDoc = await PDF.findById(_id);
    if (!pdfDoc) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }

    if (!pdfDoc.pdfFile?.fileId) {
      return res.status(400).json({
        success: false,
        message: 'PDF file ID not found in document'
      });
    }

    let pdfBuffer, signatureBuffer;
    try {
      [pdfBuffer, signatureBuffer] = await Promise.all([
        getFileFromGrid(pdfDoc.pdfFile.fileId, 'filesBucket'),
        pdfDoc.currentUserSignature?.fileId ? 
          getFileFromGrid(pdfDoc.currentUserSignature.fileId, 'signatureImages') : 
          null
      ]);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error retrieving files',
        error: error.message
      });
    }

    if (!signatureBuffer) {
      return res.status(400).json({
        success: false,
        message: 'No signature found for current user'
      });
    }

    const doc = await PDFDocument.load(pdfBuffer);
    const signatureImage = await doc.embedPng(signatureBuffer);

    for (const page of pdfDoc.pages) {
      if (!page.editCoordinates || page.editCoordinates.length === 0) continue;
      
      const pdfPage = doc.getPage(page.pageNumber - 1);
      const pageSize = pdfPage.getSize();

      for (const coord of page.editCoordinates) {
        const { x, y } = convertPercentageToCoordinates(coord.x, coord.y, pageSize);
        
        // Calculate dimensions while maintaining aspect ratio and respecting max height
        let signatureHeight = MAX_SIGNATURE_HEIGHT;
        let signatureWidth = (signatureHeight / signatureImage.height) * signatureImage.width;

        // If width is too large (more than 20% of page width), scale down proportionally
        const maxWidth = pageSize.width * 0.2;
        if (signatureWidth > maxWidth) {
          signatureWidth = maxWidth;
          signatureHeight = (signatureWidth / signatureImage.width) * signatureImage.height;
        }

        pdfPage.drawImage(signatureImage, {
          x,
          y: y - signatureHeight,
          width: signatureWidth,
          height: signatureHeight
        });
      }
    }

    const modifiedPdfBuffer = await doc.save();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', modifiedPdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="signed_${pdfDoc.originalFilename}"`);

    // Create a readable stream from the buffer and pipe it to the response
    const pdfStream = bufferToStream(modifiedPdfBuffer);
    pdfStream.pipe(res);

  } catch (error) {
    console.error('Error processing PDF:', error);
    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error processing PDF',
        error: error.message
      });
    }
  }
}

module.exports = handlePDFSignature;