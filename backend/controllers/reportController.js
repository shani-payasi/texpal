const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const { getDateRange, generateCSV, generatePDF } = require('../services/reportService');

/**
 * @desc    Generate financial report (PDF or CSV)
 * @route   POST /api/reports/generate
 * @access  Private
 */
const generateReport = asyncHandler(async (req, res) => {
  const { reportType, period, format = 'pdf', customStartDate, customEndDate } = req.body;

  if (!reportType || !period) {
    return res.status(400).json({ success: false, message: 'Report type and period are required' });
  }

  const { startDate, endDate } = getDateRange(period, customStartDate, customEndDate);

  let result;
  if (format.toLowerCase() === 'csv') {
    result = await generateCSV({
      userId: req.user._id,
      user: req.user,
      reportType,
      period,
      startDate,
      endDate,
    });
  } else {
    result = await generatePDF({
      userId: req.user._id,
      user: req.user,
      reportType,
      period,
      startDate,
      endDate,
    });
  }

  const report = await Report.create({
    userId: req.user._id,
    title: `${reportType} (${period})`,
    reportType,
    period,
    startDate,
    endDate,
    format: format.toLowerCase(),
    fileName: result.fileName,
    filePath: result.filePath,
    summaryData: result.summaryData,
  });

  res.status(201).json({
    success: true,
    message: 'Report generated successfully',
    report,
  });
});

/**
 * @desc    Get user's generated reports list
 * @route   GET /api/reports
 * @access  Private
 */
const getReports = asyncHandler(async (req, res) => {
  const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: reports.length,
    reports,
  });
});

/**
 * @desc    Get single report metadata
 * @route   GET /api/reports/:id
 * @access  Private
 */
const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  res.json({ success: true, report });
});

/**
 * @desc    Download report file
 * @route   GET /api/reports/:id/download
 * @access  Private
 */
const downloadReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  if (!fs.existsSync(report.filePath)) {
    return res.status(404).json({ success: false, message: 'Report file is no longer available on server' });
  }

  res.download(report.filePath, report.fileName);
});

module.exports = {
  generateReport,
  getReports,
  getReportById,
  downloadReport,
};

