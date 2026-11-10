const mongoose = require('mongoose');

// Tax slab schema - income range aur tax rate define karo
const taxSlabSchema = new mongoose.Schema({
  minIncome: {
    type: Number,
    required: true,
  },
  maxIncome: {
    type: Number,
    default: null, // null matlab unlimited / infinity
  },
  rate: {
    type: Number, // percentage as float e.g. 0.05 for 5% or 5
    required: true,
  },
});

// Deduction schema - tax deductions like 80C, 80D etc.
const deductionSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  maxLimit: { type: Number, default: 0 },
  description: { type: String, default: '' },
});

// Tax Profile schema - country wise tax rules
const taxProfileSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      index: true,
    },
    region: {
      type: String,
      default: 'Federal/All',
    },
    financialYear: {
      type: String,
      required: true,
    },
    // old regime ya new regime
    regime: {
      type: String,
      required: true,
    },
    standardDeduction: {
      type: Number,
      default: 0,
    },
    // tax slabs array - income ranges with rates
    taxSlabs: [taxSlabSchema],
    // available deductions
    deductions: [deductionSchema],
    // kab se kab tak valid hai
    effectiveFrom: {
      type: Date,
    },
    effectiveTo: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    // cess rate - India ke liye 4% health & education cess
    cessRate: {
      type: Number,
      default: 0.04,
    },
    // disclaimer message
    disclaimer: {
      type: String,
      default:
        'TaxPal provides estimated tax calculations for informational purposes only. It is not a substitute for professional tax advice.',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TaxProfile', taxProfileSchema);
