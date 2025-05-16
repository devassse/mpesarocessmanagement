const Directory = require('../../models/dir/directory');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user'); // Make sure to import the User model

const checkUserPermissionInAncestors = async (directoryId, userId, permission) => {
  let currentDirectory = await Directory.findById(directoryId).populate('groups');
  while (currentDirectory) {
    for (const group of currentDirectory.groups) {
      const populatedGroup = await Group.findById(group);
      if (populatedGroup && populatedGroup.users.includes(userId) && populatedGroup.userPermissions.includes(permission)) {
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

const checkUserPermissionInDirectory = async (directoryId, userId, permissions) => {
  const directory = await Directory.findById(directoryId).populate('groups');
  for (const group of directory.groups) {
    const populatedGroup = await Group.findById(group);
    if (populatedGroup && populatedGroup.users.includes(userId)) {
      for (const permission of permissions) {
        if (populatedGroup.userPermissions.includes(permission)) {
          return true;
        }
      }
    }
  }
  return false;
};


const getDirectoryById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    // Fetch the user to check their roles
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasFullAccess = user.roles.some(role => ['Admin', 'Editor'].includes(role));
    const hasViewAccess = user.roles.includes('View');

    const directory = await Directory.findOne({ _id: id, deleted: false })
      .populate({
        path: 'children',
        match: { deleted: false }
      })
      .populate({
        path: 'files',
        match: { deleted: false, isActiveVersion: true },
        select: '-content'
      })
      .populate('groups');

    if (!directory) {
      return res.status(200).json({ error: 'Directory not found' });
    }

    let processedDirectory = directory.toObject();

    if (hasViewAccess) {
      // If user has View access, only grant 'read' permission
      processedDirectory.permissions = ['read'];
    }
    if (hasFullAccess) {
      // If user has full access, grant all permissions
      processedDirectory.permissions = ['read', 'write', 'invite_member'];
    } else {
      const permissions = new Set();
      const hasInviteMemberPermission = await checkUserPermissionInAncestors(id, userId, 'invite_member');
      if (hasInviteMemberPermission) {
        permissions.add('invite_member');
        permissions.add('write');
      }

      const hasReadPermission = await checkUserPermissionInDirectory(id, userId, ['read']);
      const hasWritePermission = await checkUserPermissionInDirectory(id, userId, ['write']);
      
      if (hasReadPermission) permissions.add('read');
      if (hasWritePermission) permissions.add('write');
      
      if (!hasReadPermission && !hasWritePermission && !hasInviteMemberPermission && !hasViewAccess) {
        return res.status(403).json({ error: 'You do not have permission to access this directory' });
      }

      processedDirectory.permissions = Array.from(permissions);
    }

    if (!hasFullAccess && !hasViewAccess && processedDirectory.children) {
      // Filter children based on read or write permissions
      processedDirectory.children = await Promise.all(processedDirectory.children.map(async (child) => {
        const hasChildReadPermission = await checkUserPermissionInDirectory(child._id, userId, ['read']);
        const hasChildWritePermission = await checkUserPermissionInDirectory(child._id, userId, ['write']);
        return (hasChildReadPermission || hasChildWritePermission) ? child : null;
      }));
      processedDirectory.children = processedDirectory.children.filter(child => child !== null);
    }

    res.status(200).json(processedDirectory);
  } catch (error) {
    console.error('Error in getDirectoryById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getDirectoryById;