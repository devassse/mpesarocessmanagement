const mongoose = require('mongoose');

// Define the File schema
const fileVersionSchema = new mongoose.Schema({
    mainVersion: {
       type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    },
    ListOfVersions: [
        {
            file: {type: mongoose.Schema.Types.ObjectId, ref: 'File'},
            isActive: {type: mongoose.Schema.Types.Boolean}

        }
    ]
 
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create the File model using the specific database connection
const FileVersion = mongoose.model('FileVersion', fileVersionSchema);

module.exports = FileVersion;
