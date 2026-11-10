const mongoose = require('mongoose');

// Tax Estimate schema - user ka calculated tax estimate
const taxEstimateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      default: '',
    },
    financialYear: {
      type: String,
      required: true,
    },
    // Q1, Q2, Q3, Q4 ya Annual
    quarter: {
      type: String,
      enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'],
      default: 'Annual',
    },

    // income aur expense details
    totalIncome: {
      type: Number,
      required: true,
    },
    businessExpenses: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },

    // calculated tax values
    taxableIncome: {
      type: Number,
      required: true,
    },
    estimatedTax: {
      type: Number,
      required: true,
    },
    quarterlyEstimatedTax: {
      type: Number,
      default: 0,
    },
    effectiveTaxRate: {
      type: Number,
      default: 0,
    },

    // kis tax profile se calculate hua
    taxProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaxProfile',
    },
    // detailed breakdown of calculation
    calculationDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// latest estimates pehle dikhane ke liye index
taxEstimateSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TaxEstimate', taxEstimateSchema);
