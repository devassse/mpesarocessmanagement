const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new mongoose.Schema({
  reportName: {
    type: String,
    required: true,
  },
  reportMonth: {
    type: [String],
    required: true,
  },
  fileColumns: {
    type: Schema.Types.Mixed,
    required: true,
  },
  fileRows: {
    type: Schema.Types.Mixed,
    required: true,
  },
},
{
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;