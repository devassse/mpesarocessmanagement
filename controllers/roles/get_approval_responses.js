const File = require('../../models/dir/file');


const get_approval_res = async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Find all files created by the current user
      const files = await File.find({ createdBy: userId });
  
      // Extract approval responses from these files
      const approvalResponses = files.flatMap(file => 
        file.approvalRequests.map(request => ({
          id: request._id,
          fileId: file._id,
          status: request.status,
          reason: request.remark || '',
          fileName: file.name
        }))
      ).filter(response => response.status !== 'pending');
  
      res.json(approvalResponses);
    } catch (error) {
      console.error('Error fetching approval responses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  module.exports = get_approval_res;