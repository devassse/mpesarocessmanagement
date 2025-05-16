const mongoose = require('mongoose');
const Directory = require('../../models/dir/directory');
const File = require('../../models/dir/file');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

const checkWritePermission = async (directoryId, userId) => {
    const directory = await Directory.findById(directoryId).populate('groups');
    for (const groupId of directory.groups) {
        const group = await Group.findById(groupId);
        if (group && group.users.includes(userId) && group.userPermissions.includes('write')) {
            return true;
        }
    }
    return false;
};

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

const editFile = async (req, res) => {
    const { fileId } = req.params;
    let { name, title, content } = req.body;
    const userId = req.user._id;
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "filesBucket",
    });

    try {
        // Find the file
        const file = await File.findById(fileId);
        if (!file) {
            throw new Error('File not found');
        }

        // Check if the file is approved
        if (file.approvalStatus === 'approved') {
            return res.status(403).json({ error: 'Cannot edit an approved file' });
        }

        // Check permissions
        const user = await User.findById(userId);
        const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor');
        if (!isAdmin) {
            const hasWritePermission = await checkWritePermission(file.parent, userId);
            const hasInviteMemberPermission = await checkInviteMemberPermissionRecursively(file.parent, userId);
            if (!hasWritePermission && !hasInviteMemberPermission) {
                throw new Error('You do not have permission to edit this file');
            }
        }

        // Handle file uploads if any
        if (req.files && req.files.length > 0) {
            const handleUpload = (file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = bucket.openUploadStream({
                        filename: file.originalname,
                        content_type: file.mimetype,
                    });
                    const bufferStream = require('stream').PassThrough();
                    bufferStream.end(file.buffer);
                    bufferStream.pipe(uploadStream);
                    uploadStream.on('error', (error) => reject(error));
                    uploadStream.on('finish', () => resolve(uploadStream.id));
                });
            };
            const uploadPromises = req.files.map(file => handleUpload(file));
            const results = await Promise.all(uploadPromises);
            // Add new file IDs to the existing ones
            file.gridFSFileIds = [...file.gridFSFileIds, ...results];
        }

        // Update file properties
        if (name) file.name = name;
        if (title) file.title = title;
        if (content) {
            if (typeof content === "string") {
                content = JSON.parse(content);
            }
            file.content = content;
        }

        // Save the updated file
        const updatedFile = await file.save();
        res.status(200).json(updatedFile);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = editFile;