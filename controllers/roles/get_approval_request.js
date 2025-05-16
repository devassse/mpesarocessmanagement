const File = require('../../models/dir/file');
const User = require('../../models/user');

const get_approval_request = async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Find all files where the user is listed as an approver in a pending request
      const files = await File.find({
        'approvalRequests': {
          $elemMatch: {
            user: userId,
            status: 'pending'
          }
        }
      }).populate('createdBy', 'username email');
  
      // Extract and format the relevant information
      const approverRequests = files.map(file => ({
        fileId: file._id,
        fileName: file.name,
        fileTitle: file.title,
        createdBy: {
          username: file.createdBy.username,
          email: file.createdBy.email
        },
        requestDate: file.approvalRequests.find(req => req.user.toString() === userId.toString()).requestedAt,
        approvalRequest: file.approvalRequests.find(req => req.user.toString() === userId.toString())
      }));
  
      res.json(approverRequests);
    } catch (error) {
      console.error('Error fetching approver requests:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  module.exports = get_approval_request;