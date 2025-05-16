const express = require('express');
const router = express.Router();
const Directory = require('../../../models/dir/directory');
const Group = require('../../../models/roles/group_roles');
const User = require('../../../models/user');

const getUsersWithApprovalPermission = async (directoryId) => {
    let usersWithPermission = new Set();
    let currentDirectory = await Directory.findById(directoryId).populate('groups');
    while (currentDirectory) {
        for (const group of currentDirectory.groups) {
            const populatedGroup = await Group.findById(group).populate('users');
            if (populatedGroup && populatedGroup.userPermissions.includes('checker')) {
                populatedGroup.users.forEach(user => usersWithPermission.add(user._id.toString()));
            }
        }
        if (currentDirectory.parent) {
            currentDirectory = await Directory.findById(currentDirectory.parent).populate('groups');
        } else {
            break;
        }
    }
    return Array.from(usersWithPermission);
};

const getApprovers = async (req, res) => {
    try {
        const directoryId = req.params.dirId;
        const directory = await Directory.findById(directoryId);
        if (!directory) {
            return res.status(404).json({ message: 'Directory not found' });
        }
        const usersWithPermission = await getUsersWithApprovalPermission(directoryId);
        // Fetch user details
        const userDetails = await User.find(
            { _id: { $in: usersWithPermission } },
            { email: 1, username: 1, _id: 0 } // Include email and username, exclude _id
        );
        res.json(userDetails);
    } catch (error) {
        console.error('Error fetching approval users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = getApprovers;