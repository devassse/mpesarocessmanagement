const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const stream = require('stream');

// GridFS bucket setup


// Helper function to handle individual file upload
const handleUpload = (file) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "filesBucket",
    });

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream({
            filename: file.originalname,
            content_type: file.mimetype,
        });
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
        uploadStream.on('error', (error) => reject(error));
        uploadStream.on('finish', () => resolve(uploadStream.id));
    });
};

// Route to handle multiple file uploads
const uppload_images_from_body = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const gridFSFileIds = [];
        const uploadPromises = req.files.map(file => handleUpload(file));
        const results = await Promise.all(uploadPromises);
        gridFSFileIds.push(...results);

        res.status(200).json({
            message: 'Files uploaded successfully',
            fileIds: gridFSFileIds
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).send('An error occurred while uploading the files.');
    }
};

module.exports = uppload_images_from_body;