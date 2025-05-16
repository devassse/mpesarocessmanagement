const Directory = require('../../models/dir/directory');
const getChildGroups = require('./functions/getGroupChildren');

const removeGroupFromDirectoryRecursively = async (dirId, groupId) => {
  const directory = await Directory.findById(dirId).populate('children');
  if (!directory) {
    throw new Error(`Directory with id ${dirId} not found`);
  }

  // Remove the group from the directory if present
  const groupIndex = directory.groups.indexOf(groupId);
  if (groupIndex !== -1) {
    directory.groups.splice(groupIndex, 1);
    await directory.save();
  }

  // Recursively remove the group from children directories
  for (const child of directory.children) {
    await removeGroupFromDirectoryRecursively(child._id, groupId);
  }
};

const removeGroupFromDirectory = async (req, res) => {
  const { groupId, dirId } = req.body;

  try {
    // Get all child groups recursively
    const allGroups = await getChildGroups(groupId);
    // Remove each group from the directory and its children recursively
    for (const group of allGroups) {
      await removeGroupFromDirectoryRecursively(dirId, group);
    }

    res.status(200).json({ message: 'Group and its children removed from directory and its children successfully' });
  } catch (error) {
    console.error('Error removing group from directory:', error);
    res.status(500).json({ error: 'Error removing group from directory' });
  }
};

module.exports = removeGroupFromDirectory;
