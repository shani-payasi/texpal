const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res) => {
  const { type, description, categoryId, amount, date, notes } = req.body;

  if (!type || !description || !categoryId || amount === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  // Verify category belongs to user or is default
  const category = await Category.findOne({
    _id: categoryId,
    $or: [{ userId: req.user._id }, { userId: null }],
  });

  if (!category) {
    return res.status(400).json({ success: false, message: 'Invalid category selected' });
  }

  const transaction = await Transaction.create({
    userId: req.user._id,
    type,
    description,
    categoryId,
    amount: Number(amount),
    date: date ? new Date(date) : new Date(),
    notes: notes || '',
  });

  const populated = await Transaction.findById(transaction._id).populate('categoryId', 'name type color icon');

  res.status(201).json({
    success: true,
    message: 'Transaction recorded successfully',
    transaction: populated,
  });
});

/**
 * @desc    Get transactions with filters, search, sort & pagination
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    startDate,
    endDate,
    search,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  const query = { userId: req.user._id };

  if (type && (type === 'income' || type === 'expense')) {
    query.type = type;
  }

  if (category) {
    query.categoryId = category;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .populate('categoryId', 'name type color icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Transaction.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: transactions.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    transactions,
  });
});

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('categoryId', 'name type color icon');

  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  res.json({ success: true, transaction });
});

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  const { type, description, categoryId, amount, date, notes } = req.body;

  if (categoryId) {
    const category = await Category.findOne({
      _id: categoryId,
      $or: [{ userId: req.user._id }, { userId: null }],
    });
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    transaction.categoryId = categoryId;
  }

  if (type) transaction.type = type;
  if (description) transaction.description = description;
  if (amount !== undefined) transaction.amount = Number(amount);
  if (date) transaction.date = new Date(date);
  if (notes !== undefined) transaction.notes = notes;

  await transaction.save();

  const populated = await Transaction.findById(transaction._id).populate('categoryId', 'name type color icon');

  res.json({
    success: true,
    message: 'Transaction updated successfully',
    transaction: populated,
  });
});

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  res.json({ success: true, message: 'Transaction deleted successfully' });
});

/**
 * @desc    Get dashboard financial summary & chart aggregates
 * @route   GET /api/transactions/summary
 * @access  Private
 */
const getTransactionSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Aggregation for current month
  const currentMonthAgg = await Transaction.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let currentIncome = 0;
  let currentExpenses = 0;
  currentMonthAgg.forEach((item) => {
    if (item._id === 'income') currentIncome = item.total;
    if (item._id === 'expense') currentExpenses = item.total;
  });

  // Aggregation for previous month
  const prevMonthAgg = await Transaction.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: { $gte: prevMonthStart, $lte: prevMonthEnd },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let prevIncome = 0;
  let prevExpenses = 0;
  prevMonthAgg.forEach((item) => {
    if (item._id === 'income') prevIncome = item.total;
    if (item._id === 'expense') prevExpenses = item.total;
  });

  // Percentage changes
  const incomeChange = prevIncome === 0 ? (currentIncome > 0 ? 100 : 0) : Math.round(((currentIncome - prevIncome) / prevIncome) * 100);
  const expensesChange = prevExpenses === 0 ? (currentExpenses > 0 ? 100 : 0) : Math.round(((currentExpenses - prevExpenses) / prevExpenses) * 100);

  // Savings rate
  const netSavings = currentIncome - currentExpenses;
  const savingsRate = currentIncome > 0 ? Math.round((netSavings / currentIncome) * 100) : 0;

  // Monthly trends for past 6 or 12 months (Income vs Expenses chart)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyTrendAgg = await Transaction.aggregate([
    {
      $match: {
        userId: req.user._id,
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrend = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mNum = d.getMonth() + 1;
    const yNum = d.getFullYear();
    const label = `${monthNames[mNum - 1]} ${yNum.toString().slice(-2)}`;

    const incItem = monthlyTrendAgg.find((item) => item._id.year === yNum && item._id.month === mNum && item._id.type === 'income');
    const expItem = monthlyTrendAgg.find((item) => item._id.year === yNum && item._id.month === mNum && item._id.type === 'expense');

    monthlyTrend.push({
      month: label,
      income: incItem ? incItem.total : 0,
      expense: expItem ? expItem.total : 0,
      savings: (incItem ? incItem.total : 0) - (expItem ? expItem.total : 0),
    });
  }

  // Expense breakdown by category for donut chart
  const expenseBreakdownAgg = await Transaction.aggregate([
    {
      $match: {
        userId: req.user._id,
        type: 'expense',
        date: { $gte: currentMonthStart, $lte: currentMonthEnd },
      },
    },
    {
      $group: {
        _id: '$categoryId',
        total: { $sum: '$amount' },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    { $sort: { total: -1 } },
  ]);

  const expenseBreakdown = expenseBreakdownAgg.map((item) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color || '#6366F1',
    percentage: currentExpenses > 0 ? Math.round((item.total / currentExpenses) * 100) : 0,
  }));

  res.json({
    success: true,
    summary: {
      monthlyIncome: currentIncome,
      incomeChange,
      monthlyExpenses: currentExpenses,
      expensesChange,
      netSavings,
      savingsRate,
      monthlyTrend,
      expenseBreakdown,
    },
  });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};

