const User = require('../../models/user'); // Adjust the path as necessary

exports.activateUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'Password Recovery') {
      return res.status(400).json({ message: 'User is in password recovery' });
    }

    if (user.status === 'Active') {
      return res.status(400).json({ message: 'User is already active' });
    }

    user.status = 'Active';
    await user.save();

    res.status(200).json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ message: 'Error activating user', error: error.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'Deactivated') {
      return res.status(400).json({ message: 'User is already deactivated' });
    }

    user.status = 'Deactivated';
    await user.save();

    res.status(200).json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Error deactivating user', error: error.message });
  }
};