const express = require('express');
const getAllPDFs = require('../../controllers/get/get_current_user_pdfs');
const getCoverHTML = require('../../controllers/get/get_pdf_cover');
const getSinglePDF = require('../../controllers/get/get_single_pdf');
const retrieve_html_page = require('../../controllers/get/retrieve_html_page');
const handlePDFSignature = require('../../controllers/get/get_signed_doc');







const pdf_router_get = express.Router();

pdf_router_get.get("/get-all-pdfs", getAllPDFs)
pdf_router_get.get("/cover/:fileId", getCoverHTML);
pdf_router_get.get("/get-single-pdf/:id", getSinglePDF)
pdf_router_get.get("/pdf-pages/:pdfId", retrieve_html_page)
pdf_router_get.get('/signature/:_id', handlePDFSignature);


module.exports = pdf_router_get;
