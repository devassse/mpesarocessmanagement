const mongoose = require('mongoose');
const Directory = require('../../models/dir/directory');
const File = require('../../models/dir/file');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');
const FileVersion = require('../../models/dir/file_version');


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

const createFile = async (req, res) => {
  let { name, title, content, parent, approvalRequests } = req.body;
  const userId = req.user._id;


  let approvalRequestArray = [];

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "filesBucket",
  });

  if (!req.files) {
    req.files = [];
  }

  try {
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor');

    if (!parent && !isAdmin) {
      throw new Error('Parent directory is required for non-admin users');
    }

    if (parent) {
      if (approvalRequests) {
       let aprovalPromise = JSON.parse(approvalRequests).map(async v => {
          let user = await User.findOne({ email: v.email }, { email: 1, id: 1 }).lean()
          console.log(user)
          return {
            status: 'pending',
            user: user._id
          }
        })

        approvalRequestArray = await Promise.all(aprovalPromise)
      }
      const parentDirectory = await Directory.findById(parent);
      if (!parentDirectory) {
        throw new Error('Parent directory does not exist');
      }

      if (!isAdmin) {
        const hasWritePermission = await checkWritePermission(parent, userId);
        const hasInviteMemberPermission = await checkInviteMemberPermissionRecursively(parent, userId);

        if (!hasWritePermission && !hasInviteMemberPermission) {
          throw new Error('You do not have permission to create a file in this directory');
        }
      }
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

    if (typeof content === "string") {
      content = JSON.parse(content);
    }

    const newFile = new File({
      name,
      title,
      content: content,
      parent: parent || null,
      gridFSFileIds,
      approvalRequests: approvalRequestArray,
      createdBy: userId,
      version: 1,
      isActiveVersion: true
    });

    // Create a new FileVersion document
    const newFileVersion = new FileVersion({
      mainVersion: newFile._id,
      ListOfVersions: [{
        file: newFile._id,
        isActive: true
      }]
    });
    // Set the versionController of the file
    newFile.versionController = newFileVersion._id;

    const savedFile = await newFile.save();
    await newFileVersion.save();

    if (parent) {
      const parentDirectory = await Directory.findById(parent);
      parentDirectory.files.push(savedFile._id);
      await parentDirectory.save();
    }

    res.status(201).json(savedFile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = createFile;