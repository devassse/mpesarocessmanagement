const UserLog = require("../../../models/user_logs/user_logs");
const User = require("../../../models/user"); // Make sure to import the User model

const get_user_logs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { fromDate, toDate, userSearch, filter, sortBy, descending } = req.query;

    // Build the user query
    let userQuery = {};
    if (userSearch) {
      userQuery.$or = [
        { username: new RegExp(userSearch, 'i') },
        { email: new RegExp(userSearch, 'i') }
      ];
    }

    // Find matching users
    const users = await User.find(userQuery).select('_id');
    const userIds = users.map(user => user._id);

    // Build the log query
    let logQuery = { user: { $in: userIds } };

    // Date range filter
    if (fromDate || toDate) {
      logQuery.timestamp = {};
      if (fromDate) logQuery.timestamp.$gte = new Date(fromDate);
      if (toDate) logQuery.timestamp.$lte = new Date(toDate);
    }

    // General search filter
    if (filter) {
      logQuery.$or = [
        { actionDescription: new RegExp(filter, 'i') },
        { reason: new RegExp(filter, 'i') }
      ];
    }

    // Determine sort order
    const sort = {};
    if (sortBy) {
      sort[sortBy] = descending === 'true' ? -1 : 1;
    } else {
      sort.timestamp = -1; // Default sort
    }

    // Query user logs with pagination and filters
    const logs = await UserLog.find(logQuery)
      .populate({
        path: 'user',
        select: 'username email -_id'
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count of filtered logs for pagination info
    const totalLogs = await UserLog.countDocuments(logQuery);

    res.json({
      logs,
      currentPage: page,
      totalPages: Math.ceil(totalLogs / limit),
      totalLogs
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ message: 'Error fetching user logs', error: error.message });
  }
};

module.exports = get_user_logs;