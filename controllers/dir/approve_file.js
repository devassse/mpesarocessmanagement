const File = require('../../models/dir/file');

const approveFile = async (req, res) => {
  const { fileId, requestId } = req.params;
  const { status, reason } = req.body;
  const userId = req.user._id; // Assuming you have user authentication middleware

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected".' });
  }

  try {
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const approvalRequest = file.approvalRequests.id(requestId);

    if (!approvalRequest) {
      return res.status(404).json({ error: 'Approval request not found' });
    }

    if (approvalRequest.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to update this approval request' });
    }

    approvalRequest.status = status;
    approvalRequest.remark = reason || '';

    // Check if all approval requests have been processed
    const allProcessed = file.approvalRequests.every(req => req.status !== 'pending');

    if (allProcessed) {
      // Check if all approval requests are approved
      const allApproved = file.approvalRequests.every(req => req.status === 'approved');

      if (allApproved) {
        file.approvalStatus = 'approved';
      } else {
        // If any request is rejected, set the overall status to rejected
        file.approvalStatus = 'rejected';
      }
    } else {
      // If not all requests are processed, keep the status as pending
      file.approvalStatus = 'pending';
    }

    await file.save();

    res.json({ 
      message: 'Approval request updated successfully', 
      file: {
        ...file.toObject(),
        approvalStatus: file.approvalStatus,
        approvalRequests: file.approvalRequests
      }
    });

  } catch (error) {
    console.error('Error updating approval request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = approveFile;