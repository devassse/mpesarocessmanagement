const Directory = require('../../models/dir/directory');
const File = require('../../models/dir/file');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

const checkUserPermissionInDirectory = async (directoryId, userId, permissions) => {
  const directory = await Directory.findById(directoryId).populate('groups');
  if (directory) {
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
  }
  return false;
};

const getRootItems = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasFullAccess = user.roles.some(role => ['Admin', 'Editor'].includes(role));
    const hasViewAccess = user.roles.includes('View');

    const directories = await Directory.find({ parent: null, deleted: false })
      .populate('children')
      .populate({
        path: 'files',
        match: { deleted: false, },
        select: '-content'
      })
      .populate('groups');

    const files = await File.find({ parent: null, deleted: false, isActiveVersion: true })
      .select('-content');

    let processedDirectories;
    let filteredFiles;

    if (hasFullAccess) {
      processedDirectories = directories.map(dir => {
        const dirObj = dir.toObject();
        dirObj.permissions = ['read', 'write', 'invite_member'];
        return dirObj;
      });
      filteredFiles = files;
    } else if (hasViewAccess) {
      processedDirectories = directories.map(dir => {
        const dirObj = dir.toObject();
        dirObj.permissions = ['read'];
        return dirObj;
      });
      filteredFiles = files;
    } else {
      processedDirectories = await Promise.all(directories.map(async (dir) => {
        const dirObj = dir.toObject();
        const permissions = new Set();

        const hasInviteMemberPermission = await checkUserPermissionInDirectory(dir._id, userId, ['invite_member']);
        const hasReadPermission = await checkUserPermissionInDirectory(dir._id, userId, ['read']);
        const hasWritePermission = await checkUserPermissionInDirectory(dir._id, userId, ['write']);

        if (hasInviteMemberPermission) {
          permissions.add('invite_member');
          permissions.add('write');
        }
        if (hasReadPermission) permissions.add('read');
        if (hasWritePermission) permissions.add('write');

        dirObj.permissions = Array.from(permissions);

        if (permissions.size > 0) {
          if (!hasInviteMemberPermission && dirObj.children) {
            dirObj.children = await Promise.all(dirObj.children.map(async (child) => {
              const hasChildReadPermission = await checkUserPermissionInDirectory(child._id, userId, ['read']);
              const hasChildWritePermission = await checkUserPermissionInDirectory(child._id, userId, ['write']);
              return (hasChildReadPermission || hasChildWritePermission) ? child : null;
            }));
            dirObj.children = dirObj.children.filter(child => child !== null);
          }
          return dirObj;
        }
        return null;
      }));

      processedDirectories = processedDirectories.filter(dir => dir !== null);

      filteredFiles = await Promise.all(files.map(async (file) => {
        const hasReadPermission = await checkUserPermissionInDirectory(file.parent, userId, ['read']);
        const hasWritePermission = await checkUserPermissionInDirectory(file.parent, userId, ['write']);
        return (hasReadPermission || hasWritePermission) ? file : null;
      }));

      filteredFiles = filteredFiles.filter(file => file !== null);
    }
    res.status(200).json({ directories: processedDirectories, files: filteredFiles });
  } catch (error) {
    console.error('Error in getRootItems:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getRootItems;