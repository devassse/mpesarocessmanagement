const mongoose = require('mongoose');
const File = require('../../models/dir/file');
const FileVersion = require('../../models/dir/file_version');
const Directory = require('../../models/dir/directory');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

const checkWritePermission = async (directoryId, userId) => {
  const directory = await Directory.findById(directoryId).populate('groups');
  for (const groupId of directory.groups) {
    const group = await Group.findById(groupId);
    if (group && group.users.includes(userId) && group.userPermissions.includes('write')) {
      return true;
    }
  }
  return false;
};

const checkInviteMemberPermissionRecursively = async (directoryId, userId) => {
  let currentDirectory = await Directory.findById(directoryId).populate('groups');
  while (currentDirectory) {
    for (const groupId of currentDirectory.groups) {
      const group = await Group.findById(groupId);
      if (group && group.users.includes(userId) && group.userPermissions.includes('invite_member')) {
        return true;
      }
    }
    if (currentDirectory.parent) {
      currentDirectory = await Directory.findById(currentDirectory.parent).populate('groups');
    } else {
      break;
    }
  }
  return false;
};

const createNewFileVersion = async (req, res) => {
  let { fileId, name, title, content, approvalRequests } = req.body;
  console.log(fileId )
  const userId = req.user._id;

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "filesBucket",
  });

  if (!req.files) {
    req.files = [];
  }

  try {
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor');

    // Find the current file and its version controller
    const currentFile = await File.findById(fileId);
    if (!currentFile) {
      throw new Error('File not found');
    }

    const versionController = await FileVersion.findById(currentFile.versionController);
    if (!versionController) {
      throw new Error('Version controller not found');
    }

    const parent = currentFile.parent;

    let approvalRequestArray = [];
    if (parent) {
      if (approvalRequests) {
        let approvalPromise = JSON.parse(approvalRequests).map(async v => {
          let user = await User.findOne({ email: v.email }, { email: 1, id: 1 }).lean();
          console.log(user);
          return {
            status: 'pending',
            user: user._id
          };
        });
        approvalRequestArray = await Promise.all(approvalPromise);
      }

      const parentDirectory = await Directory.findById(parent);
      if (!parentDirectory) {
        throw new Error('Parent directory does not exist');
      }

      if (!isAdmin) {
        const hasWritePermission = await checkWritePermission(parent, userId);
        const hasInviteMemberPermission = await checkInviteMemberPermissionRecursively(parent, userId);
        if (!hasWritePermission && !hasInviteMemberPermission) {
          throw new Error('You do not have permission to create a file version in this directory');
        }
      }
    } else if (!isAdmin) {
      throw new Error('Parent directory is required for non-admin users');
    }

    const gridFSFileIds = [];
    const handleUpload = (file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream({
          filename: file.originalname,
          content_type: file.mimetype,
        });
        const bufferStream = require('stream').PassThrough();
        bufferStream.end(file.buffer);
        bufferStream.pipe(uploadStream);
        uploadStream.on('error', (error) => reject(error));
        uploadStream.on('finish', () => resolve(uploadStream.id));
      });
    };

    const uploadPromises = req.files.map(file => handleUpload(file));
    const results = await Promise.all(uploadPromises);
    gridFSFileIds.push(...results);

    // Revoke the current active version
    await File.findOneAndUpdate(
      { _id: fileId, isActiveVersion: true },
      { $set: { isActiveVersion: false } }
    );

    if (typeof content === "string") {
        content = JSON.parse(content);
      }
  

    // Create a new file version
    const newFileVersion = new File({
      name: name || currentFile.name,
      title: title || currentFile.title,
      content: content || currentFile.content,
      parent: parent,
      gridFSFileIds: gridFSFileIds.length > 0 ? gridFSFileIds : currentFile.gridFSFileIds,
      approvalRequests: approvalRequestArray,
      createdBy: userId,
      version: versionController.ListOfVersions.length + 1,
      isActiveVersion: true,
      versionController: versionController._id
    });

    const savedNewVersion = await newFileVersion.save();

    // Update the version controller
    versionController.ListOfVersions = versionController.ListOfVersions.map((version) => {
        return {
            file: version.file.toString(),
            isActive: false
        }
    })
    versionController.ListOfVersions.push({
      file: savedNewVersion._id,
      isActive: true
    });
    await versionController.save();

    if (parent) {
        const parentDirectory = await Directory.findById(parent);
        parentDirectory.files.push(savedNewVersion._id);
        await parentDirectory.save();
      }

    res.status(201).json(savedNewVersion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = createNewFileVersion;