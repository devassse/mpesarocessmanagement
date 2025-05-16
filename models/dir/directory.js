const mongoose = require('mongoose');

// Define the Directory schema
const directorySchema = new mongoose.Schema({
  deleted: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['directory'],
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Directory',
    default: null,
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Directory',
  }],
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
  }],
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the Directory model using the specific database connection
const Directory = mongoose.model('Directory', directorySchema);

module.exports = Directory;
