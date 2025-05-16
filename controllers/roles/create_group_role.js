const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

const createNewGroup = async (req, res) => {
    const { name, userPermissions, description, parentId } = req.body;


    try {
        // Check if parent group exists and get its permissions
        let parentPermissions = [];
        if (parentId) {
            const parentGroup = await Group.findById(parentId);
            if (!parentGroup) {
                return res.status(400).json({ error: 'Parent group not found' });
            }
            parentPermissions = parentGroup.userPermissions;
            
            // Ensure the child group's permissions are a subset of the parent's permissions
            const invalidPermissions = userPermissions.filter(perm => !parentPermissions.includes(perm));
            if (invalidPermissions.length > 0) {
                return res.status(400).json({ error: `Invalid permissions: ${invalidPermissions.join(', ')}. Must be a subset of parent's permissions.` });
            }
        }

        // Create the new group
        const newGroup = await Group.create({
            name,
            userPermissions,
            description,
            parent: parentId || null
        });

        // If the parent group exists, add the new group to its children
        if (parentId) {
            await Group.findByIdAndUpdate(parentId, {
                $push: { children: newGroup._id }
            });
        }

        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error creating new group:', error);
        res.status(500).json({ error: 'Error creating new group' });
    }
};

module.exports = createNewGroup;
