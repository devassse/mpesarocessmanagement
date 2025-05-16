const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');
const Directory = require('../../models/dir/directory');
const mongoose = require('mongoose');

/**
 * Deletes a group and handles all related cleanup operations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const deleteGroup = async (req, res) => {
    const { groupId } = req.body;  // Changed to req.body for POST request

    // Input validation
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({
            error: 'Valid groupId is required in request body'
        });
    }

    try {
        // Find the group and validate its existence
        const group = await Group.findById(groupId)
            .populate('parent')
            .populate('children')
            .lean();

        if (!group) {
            return res.status(404).json({
                error: 'Group not found'
            });
        }

        // Check if group has children
        if (group.children && group.children.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete group with child groups. Delete children first.',
                childGroups: group.children.map(child => ({
                    id: child._id,
                    name: child.name
                }))
            });
        }

        // Track statistics for the response
        const stats = {
            usersUpdated: 0,
            directoriesUpdated: 0,
            ancestorsUpdated: 0
        };

        // Run cleanup operations in parallel for better performance
        const [userUpdateResult, directoryUpdateResult] = await Promise.all([
            // 1. Remove group from users' group arrays
            User.updateMany(
                { groups: groupId },
                { $pull: { groups: groupId } }
            ),
            // 2. Remove group from directories
            Directory.updateMany(
                { groups: groupId },
                { $pull: { groups: groupId } }
            )
        ]);

        stats.usersUpdated = userUpdateResult.modifiedCount;
        stats.directoriesUpdated = directoryUpdateResult.modifiedCount;

        // 3. Update parent group if exists
        if (group.parent) {
            const parentUpdateResult = await Group.updateOne(
                { _id: group.parent._id },
                { 
                    $pull: { 
                        children: groupId,
                        'allDescendantUsers': { group: groupId }
                    }
                }
            );
            
            if (parentUpdateResult.modifiedCount > 0) {
                stats.ancestorsUpdated++;
            }

            // 4. Recursively update all ancestors' allDescendantUsers
            const updateAncestors = async (currentGroup) => {
                if (!currentGroup.parent) return;

                const ancestor = await Group.findById(currentGroup.parent).lean();

                if (ancestor) {
                    const updateResult = await Group.updateOne(
                        { _id: ancestor._id },
                        { 
                            $pull: { 
                                'allDescendantUsers': { group: groupId }
                            }
                        }
                    );

                    if (updateResult.modifiedCount > 0) {
                        stats.ancestorsUpdated++;
                    }

                    await updateAncestors(ancestor);
                }
            };

            await updateAncestors(group);
        }

        // 5. Finally, delete the group
        const deleteResult = await Group.deleteOne({ _id: groupId });

        if (deleteResult.deletedCount === 0) {
            throw new Error('Failed to delete group');
        }

        res.status(200).json({
            message: 'Group deleted successfully',
            deletedGroup: {
                id: group._id,
                name: group.name
            },
            stats: {
                ...stats,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Error deleting group:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.message
            });
        }

        if (error.name === 'MongoServerError') {
            return res.status(500).json({
                error: 'Database error',
                details: 'Error performing database operation'
            });
        }

        res.status(500).json({
            error: 'Error deleting group',
            details: error.message
        });
    }
};

module.exports = deleteGroup;