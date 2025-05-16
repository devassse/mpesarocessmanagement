const Group = require('../../models/roles/group_roles');
const User = require('../../models/user');

const addUsersToGroups = async (req, res) => {
  const { groupNames, usernames } = req.body;

  console.log('addUsersToGroups')
  try {
    // Fetch all groups
    const groups = await Group.find({ name: { $in: groupNames } }).populate('parent');
    if (groups.length !== groupNames.length) {
      const missingGroups = groupNames.filter(name => !groups.some(g => g.name === name));
      return res.status(404).json({ error: `Some groups not found: ${missingGroups.join(', ')}` });
    }

    // Fetch all users
    const users = await User.find({ username: { $in: usernames } });
    if (users.length !== usernames.length) {
      const missingUsers = usernames.filter(name => !users.some(u => u.username === name));
      return res.status(404).json({ error: `Some users not found: ${missingUsers.join(', ')}` });
    }

    // Process each group
    const updatePromises = groups.map(async (group) => {
      // Add users to the current group
      const usersToAdd = users.filter(user => !group.users.includes(user._id));
      group.users.push(...usersToAdd.map(u => u._id));

      // Update allDescendantUsers for top-level ancestor
      let currentGroup = group;
      while (currentGroup.parent) {
        currentGroup = await Group.findById(currentGroup.parent);
      }

      // Now currentGroup is the top-level ancestor
      const existingGroupIndex = currentGroup.allDescendantUsers.findIndex(
        item => item.group.toString() === group._id.toString()
      );

      if (existingGroupIndex !== -1) {
        // Update existing entry
        const existingUsers = currentGroup.allDescendantUsers[existingGroupIndex].users;
        usersToAdd.forEach(user => {
          if (!existingUsers.includes(user._id)) {
            existingUsers.push(user._id);
          }
        });
      } else {
        // Add new entry
        currentGroup.allDescendantUsers.push({
          group: group._id,
          users: usersToAdd.map(u => u._id)
        });
      }



      await currentGroup.save();
      await group.save();

      return {
        group: group.name,
        usersAdded: usersToAdd.map(u => u.username)
      };
    });

    const results = await Promise.all(updatePromises);

    // Update users with their new groups
    await User.updateMany(
      { _id: { $in: users.map(u => u._id) } },
      { $addToSet: { groups: { $each: groups.map(group => group._id) } } }
    );

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error adding users to groups:', error);
    res.status(500).json({ error: 'Error adding users to groups', message: error.message });
  }
};

module.exports = addUsersToGroups;