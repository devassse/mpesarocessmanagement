const express = require('express');
const redirectGetAllPDFs = require('../../controllers/pdf/getter/get_all_current_user_pdf');
const redirectGetCover = require('../../controllers/pdf/getter/get_cover');
const getSinglePDF = require('../../controllers/pdf/getter/get_single_pdf');
const redirectGetPDFPages = require('../../controllers/pdf/getter/redirect_get_pdf_pages');

const pdf_router_get = express.Router();




pdf_router_get.get('/get_all_current_user_pdfs', redirectGetAllPDFs);
pdf_router_get.get('/get_pdf_cover/:fileId', redirectGetCover);
pdf_router_get.get('/get_single_pdf/:id', getSinglePDF)
pdf_router_get.get('/pdf_pages/:pdfId', redirectGetPDFPages)


module.exports = pdf_router_get