const mongoose = require('mongoose');
const { Readable } = require('stream');

// Utility function to convert string to stream
const stringToStream = (string) => {
  const stream = new Readable();
  stream.push(string);   // Add the string data to stream
  stream.push(null);     // Signal end of stream
  return stream;
};

// GridFS service for string operations
const GridFSStringService = {
  // Store string content
  async storeString(content, filename, metadata = {}) {
    try {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'htmlBucket',
      });

      const uploadStream = bucket.openUploadStream(filename, {
        metadata: metadata
      });

      return new Promise((resolve, reject) => {
        const readableStream = stringToStream(content);
        
          readableStream.pipe(uploadStream);

          uploadStream.on('finish', () => {
            resolve(uploadStream.id);
          });

          uploadStream.on('error', error => reject(error));
      });
    } catch (error) {
      throw error;
    }
  },

  // Retrieve string content
  async retrieveString(fileId) {
    try {
      const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'htmlBucket'
      });

      const downloadStream = bucket.openDownloadStream(
        new mongoose.Types.ObjectId(fileId)
      );

      return new Promise((resolve, reject) => {
        let data = '';
        
        downloadStream
          .on('data', chunk => {
            data += chunk.toString();
          })
          .on('error', error => reject(error))
          .on('end', () => resolve(data));
      });
    } catch (error) {
      throw error;
    }
  }
};


module.exports = GridFSStringService;