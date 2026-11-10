const Budget = require('../models/Budget');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { calculateBudgetProgress } = require('../services/budgetService');

/**
 * @desc    Get user budgets for a specific month/year with spending calculation
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
  const year = parseInt(req.query.year, 10) || now.getFullYear();

  const budgets = await Budget.find({
    userId: req.user._id,
    month,
    year,
  }).populate('categoryId', 'name type color icon');

  const processed = await calculateBudgetProgress(req.user._id, budgets, month, year);

  res.json({
    success: true,
    month,
    year,
    count: processed.length,
    budgets: processed,
  });
});

/**
 * @desc    Create budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = asyncHandler(async (req, res) => {
  const { categoryId, limit, month, year, description } = req.body;

  if (!categoryId || limit === undefined || !month || !year) {
    return res.status(400).json({ success: false, message: 'Please provide category, limit, month, and year' });
  }

  // Verify category
  const category = await Category.findOne({
    _id: categoryId,
    $or: [{ userId: req.user._id }, { userId: null }],
  });

  if (!category) {
    return res.status(400).json({ success: false, message: 'Invalid category selected' });
  }

  // Prevent duplicate budget for same category in same month/year
  const existing = await Budget.findOne({
    userId: req.user._id,
    categoryId,
    month: Number(month),
    year: Number(year),
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'A budget for this category already exists for the selected month and year.',
    });
  }

  const budget = await Budget.create({
    userId: req.user._id,
    categoryId,
    limit: Number(limit),
    month: Number(month),
    year: Number(year),
    description: description || '',
  });

  const populated = await Budget.findById(budget._id).populate('categoryId', 'name type color icon');
  const [processed] = await calculateBudgetProgress(req.user._id, [populated], month, year);

  res.status(201).json({
    success: true,
    message: 'Budget created successfully',
    budget: processed,
  });
});

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!budget) {
    return res.status(404).json({ success: false, message: 'Budget not found' });
  }

  const { limit, description } = req.body;
  if (limit !== undefined) budget.limit = Number(limit);
  if (description !== undefined) budget.description = description;

  await budget.save();

  const populated = await Budget.findById(budget._id).populate('categoryId', 'name type color icon');
  const [processed] = await calculateBudgetProgress(req.user._id, [populated], budget.month, budget.year);

  res.json({
    success: true,
    message: 'Budget updated successfully',
    budget: processed,
  });
});

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!budget) {
    return res.status(404).json({ success: false, message: 'Budget not found' });
  }

  res.json({ success: true, message: 'Budget removed successfully' });
});

/**
 * @desc    Get overall budget summary for current month
 * @route   GET /api/budgets/summary
 * @access  Private
 */
const getBudgetSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
  const year = parseInt(req.query.year, 10) || now.getFullYear();

  const budgets = await Budget.find({
    userId: req.user._id,
    month,
    year,
  }).populate('categoryId', 'name type color icon');

  const processed = await calculateBudgetProgress(req.user._id, budgets, month, year);

  const totalBudget = processed.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = processed.reduce((acc, b) => acc + b.spent, 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);

  const goodCount = processed.filter((b) => b.status === 'Good').length;
  const warningCount = processed.filter((b) => b.status === 'Warning').length;
  const exceededCount = processed.filter((b) => b.status === 'Exceeded').length;

  let overallHealth = 'Good';
  if (exceededCount > 0) overallHealth = 'Exceeded';
  else if (warningCount > 0) overallHealth = 'Warning';

  res.json({
    success: true,
    summary: {
      month,
      year,
      totalBudget,
      totalSpent,
      remainingBudget,
      overallHealth,
      budgetCount: processed.length,
      statusCounts: {
        good: goodCount,
        warning: warningCount,
        exceeded: exceededCount,
      },
      budgets: processed,
    },
  });
});

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
};

