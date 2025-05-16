const mongoose = require('mongoose');
const Directory = require('../../../models/dir/directory');
const Group = require('../../../models/roles/group_roles');
const User = require('../../../models/user'); // Make sure to import the User model

const checkUserPermissionRecursively = async (directoryId, userId) => {
  let currentDirectory = await Directory.findById(directoryId).populate('groups');
  while (currentDirectory) {
    for (const group of currentDirectory.groups) {
      const populatedGroup = await Group.findById(group);
      if (
        populatedGroup &&
        populatedGroup.users.includes(userId) &&
        populatedGroup.userPermissions.includes('invite_member')
      ) {
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

const addDirectoryToGroupFromDir = async (req, res) => {
  const { groupId, subDirectoryId } = req.body;
  const userId = req.user._id;

  try {
    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(subDirectoryId)
    ) {
      return res.status(400).json({ message: 'Invalid group ID or sub-directory ID' });
    }

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Find the sub-directory
    const subDirectory = await Directory.findById(subDirectoryId);
    if (!subDirectory) {
      return res.status(404).json({ message: 'Sub-directory not found' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is an admin or editor
    const isAdminOrEditor = user.roles.some(role => ['Admin'].includes(role));

    let userHasPermission = isAdminOrEditor;

    if (!isAdminOrEditor) {
      // Check user permission recursively
      userHasPermission = await checkUserPermissionRecursively(subDirectoryId, userId);
    }

    if (!userHasPermission) {
      return res.status(403).json({ message: 'You do not have permission to modify this directory or its parent directories' });
    }

    // Add the group to the sub-directory using atomic update
    await Directory.updateOne(
      { _id: subDirectoryId },
      { $addToSet: { groups: groupId } }
    );

    res.status(200).json({ message: 'Group added to sub-directory successfully' });
  } catch (error) {
    console.error('Error adding group to sub-directory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = addDirectoryToGroupFromDir;