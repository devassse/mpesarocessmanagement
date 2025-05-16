const mongoose = require('mongoose');

// Define the Group schema
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userPermissions: {
    type: [String], // Array of permissions within the group
    enum: ['read', 'write', 'invite_member', "checker"],
    default: [] // Default to an empty array
  },
  description: {
    type: String, // Single role desc within the group
    required: true
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  allDescendantUsers: 
    [{
      group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
  
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the Group model
const Group = mongoose.model('Group', groupSchema);

module.exports = Group;