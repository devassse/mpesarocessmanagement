const express = require('express');
const pdf_router = express.Router();
const multer = require('multer');
const redirectserver = require('../../controllers/pdf/redirect_to_server');
const redirectSignatureUpdate = require('../../controllers/pdf/post/update_current_user_signature');

const storage = multer.memoryStorage(); // Store files in memory before processing
const upload = multer({ storage });

pdf_router.post("/redirect-to-pdf-server", upload.array("pdf",1), redirectserver);
pdf_router.put("/update/:pdfId/signature", upload.single("signature"), redirectSignatureUpdate);

module.exports = pdf_router;


module.exports = pdf_router