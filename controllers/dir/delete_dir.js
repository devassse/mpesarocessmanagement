const mongoose = require('mongoose');
const Directory = require('../../models/dir/directory');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

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

const deleteDirectory = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    // Find the directory by ID
    const directory = await Directory.findById(id);
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    // Check user permissions
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor');

    if (!isAdmin) {
      const hasWritePermission = await checkPermission(id, userId, 'write');
      const hasInviteMemberPermission = await checkInviteMemberPermissionRecursively(id, userId);
      
      if (!hasWritePermission && !hasInviteMemberPermission) {
        return res.status(403).json({ error: 'You do not have permission to delete this directory' });
      }
    }

    // Perform the soft delete
    directory.deleted = true;
    await directory.save();

    // If the directory has a parent, remove this directory from the parent's children
    if (directory.parent) {
      const parentDirectory = await Directory.findById(directory.parent);
      parentDirectory.children.pull(directory._id);
      await parentDirectory.save();
    }

    res.status(200).json({ message: 'Directory deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = deleteDirectory;