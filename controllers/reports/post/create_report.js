const Report = require('../../../models/reports/report');

const createReport = async (req, res) => {
    const reportFields = req.body;
    const reportName = reportFields.reportname;
    const reportMonth = reportFields.reportmonth;
    const fileColumns = reportFields.importedFileColumns;
    const fileRows = reportFields.importedFileRows;

    if (!reportName || !reportMonth) {
        return res.status(400).json({
            message: 'Report Name and Month are required',
        });
    }

    const newReport = new Report({
        reportName,
        reportMonth,
        fileColumns,
        fileRows,
    });

    newReport.save()
        .then(() => {
            res.status(201).json({
                message: 'Report created successfully',
                report: newReport,
            });
        })
        .catch((error) => {
            res.status(500).json({
                message: 'Error creating report',
                error,
            });
        });

}



const updateReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const updatedReport = await Report.findByIdAndUpdate(reportId, req.body, { new: true });
        if (!updatedReport) {
            return res.status(404).json({
                message: 'Report not found',
            });
        }
        res.status(200).json({
            message: 'Report updated successfully',
            report: updatedReport,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error updating report',
            error,
        });
    }
}

module.exports = { createReport, updateReport };