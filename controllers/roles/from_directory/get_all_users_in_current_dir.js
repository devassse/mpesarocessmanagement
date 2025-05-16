const mongoose = require('mongoose');
const Directory = require('../../../models/dir/directory');
const Group = require('../../../models/roles/group_roles');
const User = require('../../../models/user');

const getAllUsersInCurrentDirectoryGroup = async (req, res) => {
  const { directoryId } = req.query;
  const userId = req.user._id;

  try {
    // Validate directoryId
    if (!mongoose.Types.ObjectId.isValid(directoryId)) {
      return res.status(400).json({ message: 'Invalid directory ID' });
    }

    // Find the directory and populate its groups
    const directory = await Directory.findById(directoryId).populate('groups');
    if (!directory) {
      return res.status(404).json({ message: 'Directory not found' });
    }

    if (!directory.groups || directory.groups.length === 0) {
      return res.status(404).json({ message: 'No groups found in this directory' });
    }

    // Fetch all groups at once
    const allGroups = await Group.find({}).lean();

    // Build a map for quick access
    const groupMap = new Map();
    allGroups.forEach(group => {
      groupMap.set(group._id.toString(), group);
    });

    // Function to find the root parent group
    const findRootParentGroup = (groupId) => {
      let currentGroup = groupMap.get(groupId.toString());
      const visited = new Set();
      while (currentGroup.parent) {
        if (visited.has(currentGroup._id.toString())) {
          throw new Error('Circular group hierarchy detected');
        }
        visited.add(currentGroup._id.toString());
        currentGroup = groupMap.get(currentGroup.parent.toString());
      }
      return currentGroup;
    };

   

    // Collect all root parent groups
    const rootParentGroupIds = new Set();
    for (const group of directory.groups) {
      const rootGroup = findRootParentGroup(group._id);
      rootParentGroupIds.add(rootGroup._id.toString());
    }

    // Check if the user is a member of any group in the directory
    let isUserMember = false;
    const uniqueUserIds = new Set();

    for (const rootGroupId of rootParentGroupIds) {
      const rootGroup = groupMap.get(rootGroupId);
      const visitedGroups = new Set();

      // Recursive function to collect users from descendants
      const collectUsersFromDescendants = (groupId) => {
        if (visitedGroups.has(groupId)) return;
        visitedGroups.add(groupId);

        const group = groupMap.get(groupId);
        if (group.users && group.users.length > 0) {
          group.users.forEach(uid => uniqueUserIds.add(uid.toString()));
          if (group.users.some(uid => uid.toString() === userId.toString())) {
            isUserMember = true;
          }
        }

        allGroups.forEach(childGroup => {
          if (childGroup.parent && childGroup.parent.toString() === groupId) {
            collectUsersFromDescendants(childGroup._id.toString());
          }
        });
      };

      // Collect users starting from the root group
      collectUsersFromDescendants(rootGroupId);
    }

    if (!isUserMember) {
      return res.status(403).json({ message: 'You are not a member of any group in this directory' });
    }

    // Fetch user details for all unique user IDs
    const users = await User.find(
      { _id: { $in: Array.from(uniqueUserIds) } },
      'username email'
    ).lean();

    // Format the user data
    const formattedUsers = users.map(user => ({
      userId: user._id,
      username: user.username,
      email: user.email
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users in directory groups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = getAllUsersInCurrentDirectoryGroup;
