const express = require('express');
const mongoose = require('mongoose');
const FileVersion = require('../../models/dir/file_version'); // Adjust the path as needed
const File = require('../../models/dir/file'); // 


const getAllVersions = async (req, res) => {
    const { fileId } = req.params;
  
    try {
      // Validate fileId
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ error: 'Invalid file ID' });
      }
  
      // Find the file to ensure it exists
      const file = await File.findById(fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
  
      // Find the FileVersion document for this file
      const fileVersion = await FileVersion.findById(file.versionController)
        .populate({
          path: 'ListOfVersions.file',
          select: 'name title version createdAt updatedAt isActiveVersion' // Select the fields you want to include
        });
  
      if (!fileVersion) {
        return res.status(404).json({ error: 'No versions found for this file' });
      }
  
      // Sort versions by version number (assuming it's stored in the File document)
      const sortedVersions = fileVersion.ListOfVersions.sort((a, b) => 
        b.file.version - a.file.version
      );
  
      res.status(200).json({
        mainVersion: fileVersion.mainVersion,
        versions: sortedVersions
      });
  
    } catch (error) {
      console.error('Error in getFileVersions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  module.exports = getAllVersions;