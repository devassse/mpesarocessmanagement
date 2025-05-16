const mongoose = require('mongoose');
const Directory = require('../../../models/dir/directory'); // Adjust the path as needed
const Group = require('../../../models/roles/group_roles'); // Adjust the path as needed

const getAllGroupsAndChildrenInDirectory = async (req, res) => {
  const { directoryId } = req.query;
  const userId = req.user._id; // Assuming you have authentication middleware that sets req.user

  try {
    // Validate directoryId
    if (!mongoose.Types.ObjectId.isValid(directoryId)) {
      return res.status(400).json({ message: 'Invalid directory ID' });
    }

    // Find the directory and populate its groups
    const directory = await Directory.findById(directoryId).populate('groups');
    if (!directory) {
      return res.status(200).json([]);
    }

    if (!directory.groups || directory.groups.length === 0) {
      return res.status(200).json([]);
    }

    // Collect top-level parent groups
    const topLevelParentGroups = new Map(); // Map to avoid duplicates
    for (const group of directory.groups) {
      let currentGroup = group;
      while (currentGroup.parent) {
        currentGroup = await Group.findById(currentGroup.parent).lean();
        if (!currentGroup) {
          break; // Parent group not found
        }
      }
      // currentGroup is now the top-level parent group
      if (currentGroup) {
        topLevelParentGroups.set(currentGroup._id.toString(), currentGroup);
      } else {
        // If no parent, the group itself is top-level
        topLevelParentGroups.set(group._id.toString(), group);
      }
    }

    // Collect groups where the user is a member of the parent group
    const userGroups = [];

    for (const [topGroupId, topGroup] of topLevelParentGroups.entries()) {
      // Check if user is in the top-level group
      const isUserInTopGroup = topGroup.users?.some(uid => uid.toString() === userId.toString());

      if (isUserInTopGroup) {
        // Collect all descendant groups
        const collectAllDescendants = async (group) => {
          const groupWithChildren = await Group.findById(group._id).populate('children').lean();
          if (!groupWithChildren) return null;

          const formattedGroup = {
            groupId: groupWithChildren._id,
            name: groupWithChildren.name,
            description: groupWithChildren.description,
            userPermissions: groupWithChildren.userPermissions,
            children: []
          };

          // Recursively collect and format children
          for (const child of groupWithChildren.children || []) {
            const childGroup = await collectAllDescendants(child);
            if (childGroup) {
              formattedGroup.children.push(childGroup);
            }
          }

          return formattedGroup;
        };

        const groupHierarchy = await collectAllDescendants(topGroup);
        if (groupHierarchy) {
          userGroups.push(groupHierarchy);
        }
      }
    }

    if (userGroups.length === 0) {
      return res.status(200).json([]);
    }

    res.json(userGroups);
  } catch (error) {
    console.error('Error fetching groups and children in directory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = getAllGroupsAndChildrenInDirectory;
