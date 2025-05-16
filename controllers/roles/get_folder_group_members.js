const Directory = require('../../models/dir/directory');
const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');
// NOT BEING USED ----------------------------------------------------------------
const get_folder_group_members = async (req, res) => {
  const { folderId } = req.query;
  const userId = req.user._id; // Assuming you have user info in the request after authentication

  try {
    // Find the directory and populate its groups
    const directory = await Directory.findById(folderId).populate('groups');

    if (!directory) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Filter and populate groups that the user is a member of
    const userGroups = await Group.find({
      _id: { $in: directory.groups },
      users: userId
    }).populate('users', 'username email'); // Adjust fields as needed

    // Format the response
    const groupsWithMembers = userGroups.map(group => ({
      _id: group._id,
      name: group.name,
      userPermissions: group.userPermissions,
      members: group.users
    }));

   console.log("activared")

    res.status(200).json(groupsWithMembers);
  } catch (error) {
    console.error('Error fetching user folder groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = get_folder_group_members;