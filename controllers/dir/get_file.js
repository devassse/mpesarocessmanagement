const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const File = require('../../models/dir/file');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');
const Directory = require('../../models/dir/directory');

const checkPermission = async (directoryId, userId, permissionType) => {
  const directory = await Directory.findById(directoryId).populate('groups');
  for (const groupId of directory.groups) {
    const group = await Group.findById(groupId);
    if (group && group.users.includes(userId) && group.userPermissions.includes(permissionType)) {
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


const getFileById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    // Find the file document by ID and ensure it's not deleted
    const file = await File.findOne({ _id: id, deleted: false }).populate({
      path: 'approvalRequests.user',
      select: 'email username _id' // Include email, username, and _id
    }).populate({ path: 'createdBy', select: 'email username -_id'});

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check user permissions
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor') || user.roles.includes('View');

    console.log(isAdmin )
    if (!isAdmin && file.parent) {
      const hasReadPermission = await checkPermission(file.parent, userId, 'read');
      const hasWritePermission = await checkPermission(file.parent, userId, 'write');
      const hasInviteMemberPermission = await checkInviteMemberPermissionRecursively(file.parent, userId);
      if (!hasReadPermission && !hasWritePermission && !hasInviteMemberPermission) {
        return res.status(403).json({ error: 'You do not have permission to access this file' });
      }
    } else if (!file.parent && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to access this file' });
    }

    

    // Create a new GridFSBucket instance
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'filesBucket'
    });

    // Get file metadata for each GridFS file ID
    const gridFSFileInfos = await Promise.all(
      file.gridFSFileIds.map(async (fileId) => {
        const fileInfo = await mongoose.connection.db.collection('filesBucket.files').findOne({ _id: new mongoose.Types.ObjectId(fileId) });
        return fileInfo;
      })
    );

    // Add canApprove property to each approval request
    const updatedApprovalRequests = file.approvalRequests.map(request => ({
      ...request.toObject(),
      canApprove: request.user._id.toString() === userId.toString() && request.status === 'pending'
    }));

    // Prepare the response object
    const responseObject = {
      ...file.toObject(),
      approvalRequests: updatedApprovalRequests,
      gridFSFileInfos
    };

    // Include the GridFS file info and updated approval requests in the response
    res.status(200).json(responseObject);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = getFileById;