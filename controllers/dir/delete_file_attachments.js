const mongoose = require('mongoose');
const File = require('../../models/dir/file'); // Adjust the path as necessary
const User = require('../../models/user'); // Adjust the path as necessary
const Directory = require('../../models/dir/directory'); // Adjust the path as necessary
const Group = require('../../models/roles/group_roles'); // Adjust the path as necessary

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

const deleteGridFSFileIds = async (req, res) => {
    const { fileId } = req.body;
    const { gridFSFileIds } = req.body;
    const userId = req.user._id;

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "filesBucket",
    });

    try {
        // Find the file
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Get the directory from file.parent
        const directory = await Directory.findById(file.parent);
        if (!directory) {
            return res.status(404).json({ error: 'Parent directory not found' });
        }

        // Check permissions
        const user = await User.findById(userId);
        const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor');
        if (!isAdmin) {
            const hasWritePermission = await checkWritePermission(directory._id, userId);
            const hasInviteMemberPermission = await checkInviteMemberPermissionRecursively(directory._id, userId);
            if (!hasWritePermission && !hasInviteMemberPermission) {
                return res.status(403).json({ error: 'You do not have permission to delete files from this document' });
            }
        }

        // Validate gridFSFileIds
        if (!Array.isArray(gridFSFileIds) || gridFSFileIds.length === 0) {
            return res.status(400).json({ error: 'Invalid gridFSFileIds provided' });
        }

        // Filter out the IDs to be deleted
        const remainingIds = file.gridFSFileIds.filter(id => !gridFSFileIds.includes(id.toString()));

        // Delete the files from GridFS
        const deletePromises = gridFSFileIds.map(id => 
            bucket.delete(new mongoose.Types.ObjectId(id))
                .catch(err => console.error(`Failed to delete file ${id} from GridFS: ${err.message}`))
        );

        await Promise.all(deletePromises);

        // Update the file document
        file.gridFSFileIds = remainingIds;
        await file.save();

        res.status(200).json({ message: 'GridFS files deleted successfully', updatedFile: file });
    } catch (error) {
        console.error('Error in deleteGridFSFileIds:', error);
        res.status(500).json({ error: 'An error occurred while deleting GridFS files' });
    }
};

module.exports = deleteGridFSFileIds;