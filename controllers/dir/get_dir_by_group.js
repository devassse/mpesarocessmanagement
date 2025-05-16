const Directory = require('../../models/dir/directory');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

const getDirectoriesByGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  try {
    // Verify the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Fetch the user to check if they're an admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isAdmin = user.roles.includes('Admin') || user.roles.includes('Editor');

    // If the user is not an admin, return an error
    if (!isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to access this group\'s directories' });
    }

    // Fetch directories associated with the group
    let directories = await Directory.find({
      groups: groupId,
      deleted: false
    })

    // Process directories
    const processedDirectories = directories.map(directory => {
      let processedDirectory = directory.toObject();
      processedDirectory.permissions = ['read', 'write', 'invite_member'];
      return processedDirectory;
    });

    res.status(200).json(processedDirectories);
  } catch (error) {
    console.error('Error in getDirectoriesByGroup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = getDirectoriesByGroup;