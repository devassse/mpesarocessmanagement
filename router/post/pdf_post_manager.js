const express = require('express');
const updateCurrentUserPDFImage = require('../../controllers/post/pdf_manager/update_pdf_current_signature');
const multer = require('multer');
const handleBulkEditCoordinates = require('../../controllers/post/pdf_manager/handle_edit_coords');


// Signature Upload Storage Configuration
const signatureStorage = multer.memoryStorage();

const signatureUpload = multer({
  storage: signatureStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for signatures
});






const pdf_router_post = express.Router();


pdf_router_post.put('/update/:pdfId/signature',signatureUpload.single('signature'), updateCurrentUserPDFImage)
pdf_router_post.put('/handle_update/:Id/coordinates', handleBulkEditCoordinates);


module.exports = pdf_router_post;