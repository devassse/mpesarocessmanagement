const express = require('express');
const mongoose = require('mongoose');
const Group = require('../../../models/roles/group_roles'); // Adjust path as needed
const User = require('../../../models/user'); // Adjust path as needed

const getUsersInGroup = async (req, res) => {
  const { groupId } = req.params;

  const { page = 1, limit = 10 } = req.query;

  try {
    // Validate groupId
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ message: 'Invalid group ID' });
    }

    // Find the group and populate children
    const group = await Group.findById(groupId).populate('children', 'name description');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get users in the group with pagination
    const users = await User.find({ _id: { $in: group.users } })
      .select('username email') // Add or remove fields as needed
      .skip(skip)
      .limit(Number(limit));

    // Get total count of users in the group
    const totalUsers = await User.countDocuments({ _id: { $in: group.users } });

    res.status(200).json({
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        children: group.children
      },
      users,
      currentPage: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    });
  } catch (error) {
    console.error('Error getting users in group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = getUsersInGroup;