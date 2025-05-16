const express = require('express');
const mongoose = require('mongoose');
const Group = require('../../../models/roles/group_roles');
const User = require('../../../models/user');

const addUsersToGroup = async (req, res) => {
  const { groupId, userIds } = req.body;
  const userId = req.user._id; // Assuming you have authentication middleware that sets req.user

  try {
    // Validate groupId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    // Find the group
    let group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is an admin or editor
    const isAdminOrEditor = user.roles.some(role => ['Admin'].includes(role));

    let userHasPermission = isAdminOrEditor;
    let topLevelAncestor = null;

    if (!isAdminOrEditor) {
      // Check if the user has invite_member permission in the group or any parent group
      let currentGroup = group;
      while (currentGroup) {
        if (currentGroup.users.includes(userId) && currentGroup.userPermissions.includes('invite_member')) {
          userHasPermission = true;
        }
        if (!currentGroup.parent) {
          topLevelAncestor = currentGroup;
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
      return res.status(403).json({ message: 'You do not have permission to modify this group or its subgroups' });
    }

    // Rest of the function remains the same
    // Validate and find users
    const validUserIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const users = await User.find({ _id: { $in: validUserIds } });
    if (users.length !== validUserIds.length) {
      return res.status(400).json({ message: 'One or more user IDs are invalid' });
    }

    // Add users to the group
    const newUsers = validUserIds.filter(id => !group.users.includes(id));
    if (newUsers.length > 0) {
      group.users.push(...newUsers);
      await group.save();
    }

    // Update allDescendantUsers for the top-level ancestor
    if (topLevelAncestor) {
      let isModified = false;
      const existingGroupIndex = topLevelAncestor.allDescendantUsers.findIndex(
        item => item.group.toString() === group._id.toString()
      );
      if (existingGroupIndex !== -1) {
        // Update existing entry
        const existingUsers = topLevelAncestor.allDescendantUsers[existingGroupIndex].users;
        newUsers.forEach(userId => {
          if (!existingUsers.includes(userId)) {
            existingUsers.push(userId);
            isModified = true;
          }
        });
      } else {
        // Add new entry
        topLevelAncestor.allDescendantUsers.push({
          group: group._id,
          users: newUsers
        });
        isModified = true;
      }
      if (isModified) {
        await topLevelAncestor.save();
      }
    }

    // Add group to each user's groups array
    const userUpdatePromises = users.map(user => {
      if (!user.groups.includes(groupId)) {
        user.groups.push(groupId);
        return user.save();
      }
      return Promise.resolve();
    });
    await Promise.all(userUpdatePromises);

    res.status(200).json({ message: 'Users added to group successfully', group });
  } catch (error) {
    console.error('Error adding users to group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = addUsersToGroup;