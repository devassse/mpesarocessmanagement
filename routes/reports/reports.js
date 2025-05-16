const express = require('express');

const { createReport } = require('../../controllers/reports/post/create_report');
const { getReports, getSingleReport, deleteReport } = require('../../controllers/reports/get/get_reports');
const { updateReport } = require('../../controllers/reports/post/create_report');

const reportsRouter = express.Router();

reportsRouter.post('/create-report', createReport);
reportsRouter.get('/get-all-reports', getReports);
reportsRouter.get('/get-single-report/:id', getSingleReport);
reportsRouter.put('/update-report/:id', updateReport);
reportsRouter.delete('/delete-report/:id', deleteReport);

module.exports = reportsRouter;