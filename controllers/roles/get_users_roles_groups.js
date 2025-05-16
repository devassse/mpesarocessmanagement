const User = require("../../models/user");

// For Roles Management -----------------------------------
const get_user_roles_groups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the page number from query params, default to 1
    const limit = 20; // Number of users per page
    const skip = (page - 1) * limit;

    console.log("get_user_roles_groups")

    // Query users with pagination, selecting username, groups and roles
    const users = await User.find({})
      .select('username groups roles department ticketId -_id') // Select username, groups and roles, exclude _id
      .populate({
        path: 'groups',
        select: 'name -_id' // Select only the name of the group, exclude _id
      })
      .skip(skip)
      .limit(limit);


    // Get total count of users for pagination info
    const totalUsers = await User.countDocuments();

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

module.exports = get_user_roles_groups;