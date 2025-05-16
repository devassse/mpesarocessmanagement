const User = require("../../models/user");
// For Roles
const get_user_by_username = async (req, res) => {
  try {
    const username = req.query.username;
    
    // Find the user by username
    const user = await User.findOne({ username })
      .select('username email roles groups status')
      .populate('groups', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the response
    const formattedUser = {
      username: user.username,
      email: user.email,
      roles: user.roles,
      groups: user.groups.map(group => group.name),
      status: user.status
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details', error: error.message });
  }
}

module.exports = get_user_by_username;