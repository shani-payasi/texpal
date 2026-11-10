const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get all categories for the user (custom + system defaults)
 * @route   GET /api/categories
 * @access  Private
 */
const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = {
    $or: [{ userId: req.user._id }, { userId: null, isDefault: true }],
  };

  if (type && (type === 'income' || type === 'expense')) {
    query.type = type;
  }

  const categories = await Category.find(query).sort({ isDefault: -1, name: 1 });

  res.json({
    success: true,
    count: categories.length,
    categories,
  });
});

/**
 * @desc    Create custom category
 * @route   POST /api/categories
 * @access  Private
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, type, color, icon } = req.body;

  if (!name || !type) {
    return res.status(400).json({ success: false, message: 'Category name and type are required' });
  }

  // Check if category name already exists for this user
  const existing = await Category.findOne({
    userId: req.user._id,
    type,
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
  });

  if (existing) {
    return res.status(400).json({ success: false, message: 'You already have a category with this name' });
  }

  const category = await Category.create({
    userId: req.user._id,
    name: name.trim(),
    type,
    color: color || '#6366F1',
    icon: icon || 'tag',
    isDefault: false,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category,
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    userId: req.user._id, // Cannot edit default categories
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found or you do not have permission to edit system default categories',
    });
  }

  const { name, color, icon } = req.body;
  if (name) category.name = name.trim();
  if (color) category.color = color;
  if (icon) category.icon = icon;

  await category.save();

  res.json({
    success: true,
    message: 'Category updated successfully',
    category,
  });
});

/**
 * @desc    Delete custom category
 * @route   DELETE /api/categories/:id
 * @access  Private
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found or system default categories cannot be deleted',
    });
  }

  // Check if in use by transactions
  const txCount = await Transaction.countDocuments({
    userId: req.user._id,
    categoryId: category._id,
  });

  if (txCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category: It is currently used by ${txCount} transaction(s). Please reassign or delete those transactions first.`,
    });
  }

  // Check if in use by budgets
  const budgetCount = await Budget.countDocuments({
    userId: req.user._id,
    categoryId: category._id,
  });

  if (budgetCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category: It is associated with ${budgetCount} active budget(s).`,
    });
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

