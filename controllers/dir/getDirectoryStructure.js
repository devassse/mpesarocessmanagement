const Directory = require('../../models/dir/directory');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

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

const getUserGroupIds = async (userId) => {
  const groups = await Group.find({ users: userId });
  return groups.map(group => group._id);
};

const populateChildren = async (directory, userId, hasFullAccess) => {
  await Directory.populate(directory, {
    path: 'children',
    match: { deleted: false },
    populate: [
      { path: 'files', match: { deleted: false }, select: 'name type size' },
      { path: 'groups', select: 'name userPermissions' }
    ]
  });

  const processedChildren = await Promise.all(directory.children.map(async (child) => {
    if (hasFullAccess) {
      child.permissions = ['read', 'write', 'invite_member'];
      await populateChildren(child, userId, hasFullAccess);
      return child;
    } else {
      const hasInviteMemberPermission = await checkUserPermissionInDirectory(child._id, userId, ['invite_member']);
      const hasReadPermission = await checkUserPermissionInDirectory(child._id, userId, ['read']);
      const hasWritePermission = await checkUserPermissionInDirectory(child._id, userId, ['write']);

      if (hasInviteMemberPermission || hasReadPermission || hasWritePermission) {
        const permissions = new Set();
        if (hasInviteMemberPermission) {
          permissions.add('invite_member');
          permissions.add('write');
        }
        if (hasReadPermission) permissions.add('read');
        if (hasWritePermission) permissions.add('write');

        child.permissions = Array.from(permissions);
        await populateChildren(child, userId, hasInviteMemberPermission);
        return child;
      }
      return null;
    }
  }));

  directory.children = processedChildren.filter(child => child !== null);
};

const getDirectories = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasFullAccess = user.roles.some(role => ['View', 'Admin', 'Editor'].includes(role));
    const userGroupIds = await getUserGroupIds(userId);

    let query = { parent: null, deleted: false };
    if (!hasFullAccess) {
      query.groups = { $in: userGroupIds };
    }

    const rootDirectories = await Directory.find(query)
      .populate('files', 'name type size')
      .populate('groups', 'name userPermissions');

    const processedRootDirectories = await Promise.all(rootDirectories.map(async (rootDir) => {
      if (hasFullAccess) {
        rootDir.permissions = ['read', 'write', 'invite_member'];
        await populateChildren(rootDir, userId, hasFullAccess);
        return rootDir;
      } else {
        const hasInviteMemberPermission = await checkUserPermissionInDirectory(rootDir._id, userId, ['invite_member']);
        const hasReadPermission = await checkUserPermissionInDirectory(rootDir._id, userId, ['read']);
        const hasWritePermission = await checkUserPermissionInDirectory(rootDir._id, userId, ['write']);

        if (hasInviteMemberPermission || hasReadPermission || hasWritePermission) {
          const permissions = new Set();
          if (hasInviteMemberPermission) {
            permissions.add('invite_member');
            permissions.add('write');
          }
          if (hasReadPermission) permissions.add('read');
          if (hasWritePermission) permissions.add('write');

          rootDir.permissions = Array.from(permissions);
          await populateChildren(rootDir, userId, hasInviteMemberPermission);
          return rootDir;
        }
        return null;
      }
    }));

    const filteredRootDirectories = processedRootDirectories.filter(dir => dir !== null);

    res.status(200).json(filteredRootDirectories);
  } catch (error) {
    console.error('Error fetching directory hierarchy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = getDirectories;