const Directory = require("../../models/dir/directory");
const Group = require("../../models/roles/group_roles");
const User = require("../../models/user"); // Make sure to import the User model

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

const createDirectory = async (req, res) => {
  const { name, parent } = req.body;
  const userId = req.user.id; // Assuming you have user information in the request

  try {
    // Check if the user is an admin
    const user = await User.findById(userId);
    const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor');

    let parentDirectory;
    let groupsToInherit = [];

    if (!isAdmin && !parent) {
      return res.status(403).json({ error: "Non-admin users cannot create top-level directories" });
    }

    if (parent) {
      parentDirectory = await Directory.findById(parent).populate('groups');
      if (!parentDirectory) {
        return res.status(404).json({ error: "Parent directory not found" });
      }
      groupsToInherit = parentDirectory.groups.map(group => group._id);

      // Check permissions only if the user is not an admin
      if (!isAdmin) {
        const hasPermission = await checkInviteMemberPermissionRecursively(parent, userId);
        if (!hasPermission) {
          return res.status(403).json({ error: "You don't have permission to create a directory here" });
        }
      }
    }

    const newDirectory = new Directory({
      name,
      type: 'directory',
      parent,
      groups: groupsToInherit, // Inherit groups from parent
    });

    const savedDirectory = await newDirectory.save();

    // If the directory has a parent, add this directory to the parent's children
    if (parentDirectory) {
      parentDirectory.children.push(savedDirectory._id);
      await parentDirectory.save();
    }

    // Populate the groups in the response
    const populatedDirectory = await Directory.findById(savedDirectory._id).populate('groups');

    res.status(201).json(populatedDirectory);
  } catch (error) {
    console.error('Error creating directory:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = createDirectory;