const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const File = require('../../models/dir/file');

const deleteUploadedFileById = async (req, res) => {
  const { id } = req.params;

  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'filesBucket',
    });

    // Check if the file exists in GridFS
    const file = await mongoose.connection.db.collection('filesBucket.files').findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file from GridFS
    bucket.delete(file._id);

    // Update the File document to remove the gridFSFileId
    await File.updateMany(
      { gridFSFileIds: file._id },
      { $pull: { gridFSFileIds: file._id } }
    );

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = deleteUploadedFileById;
