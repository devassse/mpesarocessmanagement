const mongoose = require('mongoose');

// Schema for individual pages - now as a subdocument
const pageSchema = new mongoose.Schema({
  pageNumber: {
    type: Number,
    required: true
  },
  htmlFile: {
    filename: String,
    fileId: mongoose.Schema.Types.ObjectId,  // Reference to GridFS file
    size: Number
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  editCoordinates: [
    {
      x: Number,
      y: Number,
      dataType: {
        type: String,
        enum: ['signature'],
      },
      from: {
        type: String,
        enum: ['current_user', 'other_user'],
        default: 'current_user'
      },
      userId: mongoose.Schema.Types.ObjectId,
      eventId: String,
    }
  ],
  convertedAt: {
    type: Date,
    default: Date.now
  },
  error: String
}, {
  timestamps: true
});

// Schema for PDF documents
const pdfSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  currentUserSignature: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      auto: true
    },
    fileId: mongoose.Schema.Types.ObjectId, // Reference to GridFS file
    size: Number
  },
  pdfFile: {
    filename: String,
    fileId: mongoose.Schema.Types.ObjectId,  // Reference to GridFS file
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading',
    index: true
  },
  totalPages: {
    type: Number,
    required: true,
    min: 1
  },
  convertedPages: {
    type: Number,
    default: 0,
    min: 0,
   
  },
  error: {
    type: String,
    default: null
  },
  startTime: {
    type: Date,
    default: Date.now
  },

  completionTime: {
    type: Date,
    default: null
  },
  // Add pages as a subdocument array
  pages: [pageSchema]
}, {
  timestamps: true
});

// Create model
const PDF = mongoose.model('PDF', pdfSchema);

module.exports = PDF;