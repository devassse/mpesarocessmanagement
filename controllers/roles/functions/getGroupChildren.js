const Group = require('../../../models/roles/group_roles');

const getChildGroups = async (groupId) => {
  const group = await Group.findById(groupId).populate('children');
  if (!group) {
    throw new Error(`Group with id ${groupId} not found`);
  }

  let allGroups = [groupId];

  for (const child of group.children) {
    const childGroups = await getChildGroups(child._id);
    allGroups = allGroups.concat(childGroups);
  }

  return allGroups;
};

module.exports = getChildGroups;
