
const express = require('express');
const multer = require('multer');
const redirectCompareFaces = require('../../controllers/face_recognition/face_recog');


const storage = multer.memoryStorage(); // Store files in memory before processing
const upload = multer({ storage });
const faceRecogRedirect = express.Router();

faceRecogRedirect.post('/redirect', upload.array('files', 10), redirectCompareFaces);

module.exports = faceRecogRedirect;
