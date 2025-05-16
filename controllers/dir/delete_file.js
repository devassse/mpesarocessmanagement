const File = require('../../models/dir/file');
const Directory = require('../../models/dir/directory');
const User = require('../../models/user');
const Group = require('../../models/roles/group_roles');

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

const deleteFile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming you have user information in the request

  try {
    // Check if the user is an admin
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor');

    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check permissions only if the user is not an admin
    if (!isAdmin) {
      const hasWritePermission = await checkWritePermission(file.parent, userId);
      const hasInviteMemberPermission = await checkInviteMemberPermissionRecursively(file.parent, userId);

      console.log(hasInviteMemberPermission, hasWritePermission)
      
      if (!hasWritePermission || !hasInviteMemberPermission) {
        return res.status(403).json({ error: "You don't have permission to delete this file" });
      }
    }

    // Perform the soft delete
    const updatedFile = await File.findByIdAndUpdate(id, { deleted: true }, { new: true });

    res.status(200).json({ message: 'File deleted successfully', file: updatedFile });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = deleteFile;