const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const getUploadedFileById = async (req, res) => {
  const { id } = req.params;

  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'filesBucket',
    });

    const file = await mongoose.connection.db.collection('filesBucket.files').findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const downloadStream = bucket.openDownloadStream(file._id);

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', (err) => {
      res.status(500).json({ error: 'Error downloading file' });
    });

    downloadStream.on('end', () => {
      res.end();
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = getUploadedFileById;
