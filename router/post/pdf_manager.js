const express = require('express');
const convert_pages = require('../../controllers/post/pdf_manager/convert_pages');
const CONFIG = require('../../utils/config');
const multer = require('multer');
const ConversionError = require('../../utils/conversion_error');


// Multer functions
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, CONFIG.uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${uniqueSuffix}-${safeFilename}`);
    }
  });
  


  const upload = multer({
    storage,
    limits: { fileSize: CONFIG.maxFileSize },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        console.log("loading PDF")
        console.log(CONFIG)
        cb(null, true);
      } else {
        cb(new ConversionError('Only PDF files are allowed', 400));
      }
    }
  });







const pdf_router = express.Router();

pdf_router.post("/convert-pages", upload.single('pdf'), convert_pages)


module.exports = pdf_router;

