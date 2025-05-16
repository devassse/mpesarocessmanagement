const mongoose = require('mongoose');

// Define the User Log schema
const userLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionDescription: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create the User Log model using the specific database connection
const UserLog = mongoose.model('UserLog', userLogSchema);

module.exports = UserLog;