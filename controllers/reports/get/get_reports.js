const Report = require('../../../models/reports/report');

// Get all reports
const getReports = async (req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json({
            message: 'Reports retrieved successfully',
            reports,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving reports',
            error,
        });
    }
}

// Get a single report by ID
const getSingleReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({
                message: 'Report not found',
            });
        }

        res.status(200).json({
            message: 'Report retrieved successfully',
            report,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving report',
            error,
        });
    }
}

const deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = await Report.findByIdAndDelete(reportId);

        if (!report) {
            return res.status(404).json({
                message: 'Report not found',
            });
        }

        res.status(200).json({
            message: 'Report deleted successfully',
            report,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting report',
            error,
        });
    }
}

module.exports = { getReports, getSingleReport, deleteReport };