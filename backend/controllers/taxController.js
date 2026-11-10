const TaxProfile = require('../models/TaxProfile');
const TaxEstimate = require('../models/TaxEstimate');
const asyncHandler = require('../utils/asyncHandler');
const { calculateTaxEstimate } = require('../services/taxCalculationService');
const { getJurisdictionTaxDeadlines } = require('../services/notificationService');

/**
 * @desc    Calculate tax estimate & save to database
 * @route   POST /api/tax/calculate
 * @access  Private
 */
const calculateTax = asyncHandler(async (req, res) => {
  const {
    country,
    region,
    financialYear,
    regime,
    quarter = 'Annual',
    totalIncome,
    otherIncome = 0,
    businessExpenses = 0,
    eligibleDeductions = 0,
  } = req.body;

  if (!country || !financialYear || totalIncome === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Country, financial year, and total income are required',
    });
  }

  // Find matching configured tax profile
  const query = {
    country: { $regex: new RegExp(`^${country}$`, 'i') },
    financialYear,
  };
  if (regime) {
    query.regime = { $regex: new RegExp(regime, 'i') };
  }

  let profile = await TaxProfile.findOne(query);

  // If specific regime not found, try any profile for that country & financial year
  if (!profile) {
    profile = await TaxProfile.findOne({
      country: { $regex: new RegExp(`^${country}$`, 'i') },
    });
  }

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: `No verified tax profile is configured for ${country} (${financialYear}). TaxPal does not invent tax slabs without official rules. Please choose a supported jurisdiction or check back soon.`,
    });
  }

  // Calculate using engine
  const calculation = calculateTaxEstimate({
    totalIncome: Number(totalIncome),
    otherIncome: Number(otherIncome),
    businessExpenses: Number(businessExpenses),
    claimedDeductions: Number(eligibleDeductions),
    taxProfile: profile,
    quarter,
  });

  // Save estimate in database
  const estimate = await TaxEstimate.create({
    userId: req.user._id,
    country: profile.country,
    region: region || profile.region,
    financialYear,
    quarter,
    totalIncome: calculation.grossIncome,
    businessExpenses: calculation.businessExpenses,
    deductions: calculation.totalDeductions,
    taxableIncome: calculation.taxableIncome,
    estimatedTax: calculation.annualEstimatedTax,
    quarterlyEstimatedTax: calculation.quarterlyEstimatedTax,
    effectiveTaxRate: calculation.effectiveTaxRate,
    taxProfileId: profile._id,
    calculationDetails: calculation,
  });

  res.status(201).json({
    success: true,
    message: 'Tax calculation completed successfully',
    estimate,
  });
});

/**
 * @desc    Get user's saved tax estimates history
 * @route   GET /api/tax/estimates
 * @access  Private
 */
const getTaxEstimates = asyncHandler(async (req, res) => {
  const estimates = await TaxEstimate.find({ userId: req.user._id })
    .populate('taxProfileId', 'regime isVerified')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: estimates.length,
    estimates,
  });
});

/**
 * @desc    Get single tax estimate by ID
 * @route   GET /api/tax/estimates/:id
 * @access  Private
 */
const getTaxEstimateById = asyncHandler(async (req, res) => {
  const estimate = await TaxEstimate.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('taxProfileId');

  if (!estimate) {
    return res.status(404).json({ success: false, message: 'Tax estimate not found' });
  }

  res.json({ success: true, estimate });
});

/**
 * @desc    Get configured tax profiles
 * @route   GET /api/tax/profiles
 * @access  Private
 */
const getTaxProfiles = asyncHandler(async (req, res) => {
  const profiles = await TaxProfile.find().sort({ country: 1, financialYear: -1 });

  res.json({
    success: true,
    count: profiles.length,
    profiles,
  });
});

/**
 * @desc    Get quarterly tax calendar deadlines for user jurisdiction
 * @route   GET /api/tax/calendar
 * @access  Private
 */
const getTaxCalendar = asyncHandler(async (req, res) => {
  const country = req.query.country || req.user.country || 'India';
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  const deadlines = getJurisdictionTaxDeadlines(country, year);
  const now = new Date();

  // Find latest tax estimate for the user to provide estimated payment amounts
  const latestTax = await TaxEstimate.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
  const annualEst = latestTax ? latestTax.estimatedTax : 0;

  const calendarEvents = deadlines.map((item, index) => {
    const diffDays = Math.ceil((item.dueDate - now) / (1000 * 60 * 60 * 24));
    let status = 'upcoming';
    if (diffDays < 0) status = 'overdue';
    else if (diffDays <= 14) status = 'due';

    // India advance tax installments: Q1: 15%, Q2: 45% cumulative, Q3: 75%, Q4: 100%
    // US: 25% each quarter
    let paymentAmount = 0;
    if (country === 'India') {
      const percentages = [0.15, 0.30, 0.30, 0.25];
      paymentAmount = Math.round(annualEst * percentages[index]);
    } else {
      paymentAmount = Math.round(annualEst / 4);
    }

    return {
      id: `tax-cal-${index + 1}`,
      quarter: item.quarter,
      title: item.title,
      dueDate: item.dueDate,
      description: item.description,
      status,
      daysRemaining: diffDays,
      estimatedPaymentAmount: paymentAmount,
    };
  });

  res.json({
    success: true,
    country,
    year,
    latestTaxEstimate: annualEst,
    calendar: calendarEvents,
  });
});

module.exports = {
  calculateTax,
  getTaxEstimates,
  getTaxEstimateById,
  getTaxProfiles,
  getTaxCalendar,
};

