const UserLog = require('../../models/user_logs/user_logs');

const logUserAction = async (user, actionDescription, reason) => {
  try {
    const userLog = new UserLog({
      user,
      actionDescription,
      reason
    });

    await userLog.save();

    console.log('User action logged successfully');
  } catch (error) {
    console.error('Error logging user action:', error);
  }
};

module.exports = logUserAction;
