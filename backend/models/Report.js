const mongoose = require('mongoose');

// Report schema - generated reports (PDF/CSV) ka record rakhne ke liye
const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    // report ka type
    reportType: {
      type: String,
      enum: [
        'Income Statement',
        'Expense Statement',
        'Financial Summary',
        'Tax Report',
        'Budget Report',
        'Detailed Transactions',
      ],
      required: true,
    },
    // kis period ka report hai
    period: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    // PDF ya CSV format
    format: {
      type: String,
      enum: ['pdf', 'csv'],
      required: true,
    },
    // file ka naam aur path
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    // summary data - report ka overview
    summaryData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// latest reports pehle dikhane ke liye index
reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
