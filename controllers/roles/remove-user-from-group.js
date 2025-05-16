const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

const removeUserFromGroup = async (req, res) => {
    const { groupName, username } = req.body;

    console.log(username, groupName)

    try {
        // Find the group and user
        const group = await Group.findOne({ name: groupName }).populate('parent');
        const user = await User.findOne({ username });

        if (!group) {
            return res.status(404).json({ error: `Group not found: ${groupName}` });
        }

        if (!user) {
            return res.status(404).json({ error: `User not found: ${username}` });
        }

        // Check if the user is in the group

        console.log(group.users)
        if (!group.users.includes(user._id)) {
            return res.status(400).json({ error: `User ${username} is not in group ${groupName}` });
        }

        // Remove user from the group
        group.users = group.users.filter(userId => !userId.equals(user._id));

        // Update allDescendantUsers for top-level ancestor
        let currentGroup = group;
        while (currentGroup.parent) {
            currentGroup = await Group.findById(currentGroup.parent);
        }

        // Now currentGroup is the top-level ancestor
        currentGroup.allDescendantUsers = currentGroup.allDescendantUsers.map(item => {
            if (item.group.toString() === group._id.toString()) {
                item.users = item.users.filter(userId => !userId.equals(user._id));
            }
            return item;
        });

        // Save changes to groups
        await currentGroup.save();
        await group.save();

        // Remove group from user's groups
        await User.updateOne(
            { _id: user._id },
            { $pull: { groups: group._id } }
        );

        res.status(200).json({
            message: `User ${username} removed from group ${groupName}`,
            user: user.username,
            group: group.name
        });

    } catch (error) {
        console.error('Error removing user from group:', error);
        res.status(500).json({ error: 'Error removing user from group', message: error.message });
    }
};

module.exports = removeUserFromGroup;