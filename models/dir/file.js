const mongoose = require('mongoose');

// Define the File schema
const fileSchema = new mongoose.Schema({
  version: {
    type: Number,
  },
  isActiveVersion: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  versionController: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FileVersion',
  },
  deleted: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: [{
    subtitle: {
      type: String,
    },
    text: {
      type: String,
    },
    BPMN_string: {
      type: String,
    },

  }],
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Directory',
    default: null,
  },
  gridFSFileIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'uploads.files',
    required: false,
  }],
  approvalRequests: [{
    remark: {
      type: String,
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'approvedByAdmin', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the File model using the specific database connection
const File = mongoose.model('File', fileSchema);

module.exports = File;
