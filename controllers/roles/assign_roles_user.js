const User = require('../../models/user');

const assignRolesToUser = async (req, res) => {
    const { username, roles } = req.body;

    try {
        // Validate user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Assign roles to the user
        user.roles = roles;
        await user.save();

        res.status(200).json({ message: 'Roles assigned successfully', user: { username: user.username, roles: user.roles } });
    } catch (error) {
        console.error('Error assigning roles to user:', error);
        res.status(500).json({ error: 'Error assigning roles to user' });
    }
};

module.exports = assignRolesToUser;