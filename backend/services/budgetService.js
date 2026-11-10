// Budget Service - budget ka spending aur status calculate karo

const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');

// Budget progress calculate karo - kitna spend hua, kitna bacha
const calculateBudgetProgress = async (userId, budgets, month, year) => {
  // Month ki start aur end date nikalo
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // Is month ke saare expenses category wise aggregate karo
  const expenseAgg = await Transaction.aggregate([
    {
      $match: {
        userId: userId,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: '$categoryId',
        totalSpent: { $sum: '$amount' },
      },
    },
  ]);

  // Category-wise spent amount ka map banao
  const spentMap = {};
  expenseAgg.forEach((item) => {
    spentMap[item._id.toString()] = item.totalSpent;
  });

  const processedBudgets = [];

  for (const budget of budgets) {
    // Category ID nikalo
    const catId = budget.categoryId?._id
      ? budget.categoryId._id.toString()
      : budget.categoryId?.toString();

    // Spending calculate karo
    const spent = Math.round((spentMap[catId] || 0) * 100) / 100;
    const limit = budget.limit || 0;
    const remaining = Math.round((limit - spent) * 100) / 100;

    // Percentage calculate karo
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

    // Status decide karo - Good, Warning, ya Exceeded
    let status = 'Good';
    if (percentage > 100) {
      status = 'Exceeded';
    } else if (percentage >= 75) {
      status = 'Warning';
    }

    processedBudgets.push({
      _id: budget._id,
      category: budget.categoryId,
      limit,
      spent,
      remaining,
      percentage,
      status,
      month: budget.month,
      year: budget.year,
      description: budget.description,
      createdAt: budget.createdAt,
    });

    // Agar budget exceed hua toh alert create karo (agar pehle se nahi hai)
    if (status === 'Exceeded') {
      const categoryName = budget.categoryId?.name || 'budget';

      const existingAlert = await Alert.findOne({
        userId,
        type: 'budget_exceeded',
        title: { $regex: new RegExp(categoryName, 'i') },
        createdAt: { $gte: startDate, $lte: endDate },
      });

      if (!existingAlert) {
        await Alert.create({
          userId,
          title: `Budget Exceeded: ${budget.categoryId?.name || 'Category'}`,
          message: `You have exceeded your ${budget.categoryId?.name || ''} budget of $${limit.toLocaleString()} by $${Math.abs(remaining).toLocaleString()} this month.`,
          type: 'budget_exceeded',
          status: 'overdue',
          actionUrl: '/budgets',
        });
      }
    }
  }

  return processedBudgets;
};

module.exports = {
  calculateBudgetProgress,
};
