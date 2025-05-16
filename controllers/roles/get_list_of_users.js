const User = require("../../models/user")

const get_all_users = async (req, res) => {
  try {
    console.log("Fetching all users")
    const users = await User.find({}, 'username _id email').lean();
    
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error retrieving users' });
  }
}

module.exports = get_all_users