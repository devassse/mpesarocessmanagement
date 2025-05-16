const Group = require('../../../models/roles/group_roles');
const User = require('../../../models/user'); // Make sure to import the User model

const createGroup = async (req, res) => {
  const { name, description, userPermissions, users, parentGroupId } = req.body;
  const userId = req.user._id; // Assuming you have user information in the request

  try {
    // If parentGroupId is not provided, return
    if (!parentGroupId) {
      return res.status(400).json({ message: 'Parent group ID is required' });
    }

    // Find the parent group
    let parentGroup = await Group.findById(parentGroupId);
    if (!parentGroup) {
      return res.status(400).json({ message: 'Invalid parent group ID' });
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
      // Check if the user has invite_member permission in the parent group or its ancestors
      let currentGroup = parentGroup;
      while (currentGroup) {
        if (currentGroup.users.includes(userId) && currentGroup.userPermissions.includes('invite_member')) {
          userHasPermission = true;
          break;
        }
        // Move to the parent group
        if (currentGroup.parent) {
          currentGroup = await Group.findById(currentGroup.parent);
        } else {
          break;
        }
      }
    }

    if (!userHasPermission) {
      return res.status(403).json({ message: 'You do not have permission to create a group under this parent group' });
    }

    // Create the new group
    const newGroup = new Group({
      name,
      description,
      userPermissions,
      users: users || [userId], // Add the creating user if no users are specified
      parent: parentGroupId
    });

    await newGroup.save();

    // Add the new group to the parent group's children array
    parentGroup.children = parentGroup.children || [];
    parentGroup.children.push(newGroup._id);
    await parentGroup.save();

    // Populate the users in the new group before sending the response
    await newGroup.populate('users', 'username email');

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = createGroup;