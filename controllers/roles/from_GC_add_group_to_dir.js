const Directory = require('../../models/dir/directory');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

const fromGCaddGroupToDirectory = async (req, res) => {
  const { groupId, directoryId } = req.body;
  const userId = req.user._id;

  try {
    // Check if the user is an admin
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isAdmin = user.roles.includes('Admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }

    // Find the directory
    const directory = await Directory.findById(directoryId);
    if (!directory) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if the group is already associated with the directory
    if (directory.groups.includes(groupId)) {
      return res.status(400).json({ error: 'Group is already associated with this directory' });
    }

    // Add the group to the directory
    directory.groups.push(groupId);
    await directory.save();

    res.status(200).json({ message: 'Group successfully added to directory' });
  } catch (error) {
    console.error('Error in addGroupToDirectory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = fromGCaddGroupToDirectory;