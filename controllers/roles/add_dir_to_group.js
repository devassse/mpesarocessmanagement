const Directory = require('../../models/dir/directory');
const Group = require('../../models/roles/group_roles');

const addDirectoryToGroup = async (req, res) => {
  const { groupId, dirId } = req.body;

  try {
    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Recursive function to add directory and its children to the group
    const addDirAndChildrenToGroup = async (dirId) => {
      const directory = await Directory.findById(dirId).populate('children');
      if (!directory) {
        throw new Error(`Directory with id ${dirId} not found`);
      }
     
      // Add the group to the directory if not already present
      if (!directory.groups.includes(groupId)) {
        directory.groups.push(groupId);
        await directory.save();
      }

      // Recursively add children directories
      for (const child of directory.children) {
        await addDirAndChildrenToGroup(child._id);
      }
    };

    // Start the recursive process
    await addDirAndChildrenToGroup(dirId);

    res.status(200).json({ message: 'Directory and its children added to group successfully' });
  } catch (error) {
    console.error('Error adding directory to group:', error);
    res.status(500).json({ error: 'Error adding directory to group' });
  }
};

module.exports = addDirectoryToGroup;
