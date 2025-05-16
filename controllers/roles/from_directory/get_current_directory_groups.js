const mongoose = require('mongoose');
const Directory = require('../../../models/dir/directory');
const Group = require('../../../models/roles/group_roles');

const get_current_directory_groups_user_in = async (req, res) => {
  const { directoryId } = req.query;
  const userId = req.user._id;

  try {
    // Validate directoryId
    if (!mongoose.Types.ObjectId.isValid(directoryId)) {
      return res.status(400).json({ message: 'Invalid directory ID' });
    }

    // Find the initial directory
    let currentDirectory = await Directory.findById(directoryId);
    if (!currentDirectory) {
      return res.status(404).json({ message: 'Directory not found' });
    }

    // Traverse up to find the top-level ancestor directory
    while (currentDirectory.parent) {
      currentDirectory = await Directory.findById(currentDirectory.parent);
    }

    // Populate the groups of the top-level directory
    await currentDirectory.populate('groups');

    if (!currentDirectory.groups || currentDirectory.groups.length === 0) {
      return res.json([]); // Return an empty array
    }

    // Extract group IDs from populated groups
    const groupIds = currentDirectory.groups.map(group => group._id);

    // Get all groups where the user is a member
    const userGroups = await Group.find({
      _id: { $in: groupIds },
      $or: [
        { users: userId },
        { 'allDescendantUsers.users': userId }
      ]
    }).lean();

    if (!userGroups || userGroups.length === 0) {
      return res.json([]);
    }

    // Fetch all groups once
    const allGroups = await Group.find({}).lean();

    // Build a map for quick access
    const groupMap = new Map();
    allGroups.forEach(group => {
      groupMap.set(group._id.toString(), group);
    });

    // Function to get all descendants
    const getAllDescendantGroups = (groupId, uniqueGroupIds) => {
      for (const group of allGroups) {
        if (group.parent && group.parent.toString() === groupId.toString()) {
          const childGroupIdStr = group._id.toString();
          if (!uniqueGroupIds.has(childGroupIdStr)) {
            uniqueGroupIds.add(childGroupIdStr);
            getAllDescendantGroups(group._id, uniqueGroupIds);
          }
        }
      }
    };

    // Collect all unique group IDs including children
    const uniqueGroupIds = new Set();
    for (const group of userGroups) {
      const groupIdStr = group._id.toString();
      uniqueGroupIds.add(groupIdStr);
      getAllDescendantGroups(group._id, uniqueGroupIds);
    }

    // Fetch all unique groups
    const allUniqueGroups = allGroups.filter(group =>
      uniqueGroupIds.has(group._id.toString())
    );

    // Format the response
    const formattedGroups = allUniqueGroups.map(group => ({
      groupId: group._id,
      groupName: group.name,
      roles: group.userPermissions,
      parentId: group.parent || null
    }));

    res.json(formattedGroups);
  } catch (error) {
    console.error('Error fetching user groups and roles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = get_current_directory_groups_user_in;
