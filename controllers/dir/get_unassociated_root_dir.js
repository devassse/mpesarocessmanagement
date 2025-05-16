
const Directory = require('../../models/dir/directory');
const User = require('../../models/user');

const getUnassociatedRootDirectories = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;
  
    try {
      // Fetch the user to check if they're an admin
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const isAdmin = user.roles.includes('Admin');
  
      // If the user is not an admin, return an error
      if (!isAdmin) {
        return res.status(403).json({ error: 'You do not have permission to access this information' });
      }
  
      // Find directories with no parent and not associated with the given groupId
      const directories = await Directory.find({
        parent: null,
        groups: { $ne: groupId },
        deleted: false
      }).populate({
        path: 'files',
        match: { deleted: false, isActiveVersion: true },
        select: '-content'
      });
  
      // Process directories
      const processedDirectories = directories.map(directory => {
        let processedDirectory = directory.toObject();
        processedDirectory.permissions = ['read', 'write', 'invite_member'];
        return processedDirectory;
      });
  
      res.status(200).json(processedDirectories);
    } catch (error) {
      console.error('Error in getUnassociatedRootDirectories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  module.exports = getUnassociatedRootDirectories;