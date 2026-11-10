const crypto = require('crypto');
const User = require('../models/User');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const { checkUserTaxAlerts } = require('../services/notificationService');

// Default initial categories seeded for every new user if not present
const DEFAULT_CATEGORIES = [
  { name: 'Freelance Projects', type: 'income', icon: 'briefcase', color: '#10B981', isDefault: true },
  { name: 'Consulting', type: 'income', icon: 'file-text', color: '#059669', isDefault: true },
  { name: 'Salary', type: 'income', icon: 'dollar-sign', color: '#14B8A6', isDefault: true },
  { name: 'Business Income', type: 'income', icon: 'trending-up', color: '#06B6D4', isDefault: true },
  { name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#6366F1', isDefault: true },
  { name: 'Rent', type: 'expense', icon: 'home', color: '#EF4444', isDefault: true },
  { name: 'Utilities', type: 'expense', icon: 'zap', color: '#F97316', isDefault: true },
  { name: 'Food & Dining', type: 'expense', icon: 'coffee', color: '#F59E0B', isDefault: true },
  { name: 'Travel & Commute', type: 'expense', icon: 'navigation', color: '#EC4899', isDefault: true },
  { name: 'Software Subscriptions', type: 'expense', icon: 'code', color: '#8B5CF6', isDefault: true },
  { name: 'Marketing & Ads', type: 'expense', icon: 'megaphone', color: '#6366F1', isDefault: true },
  { name: 'Office Expenses', type: 'expense', icon: 'package', color: '#3B82F6', isDefault: true },
  { name: 'Professional Development', type: 'expense', icon: 'book-open', color: '#14B8A6', isDefault: true },
  { name: 'Other Expenses', type: 'expense', icon: 'more-horizontal', color: '#6B7280', isDefault: true },
];

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, country, region, incomeBracket, currency } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  // Check email
  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  // Check username
  const usernameExists = await User.findOne({ username: username.toLowerCase() });
  if (usernameExists) {
    return res.status(400).json({ success: false, message: 'Username is already taken' });
  }

  const user = await User.create({
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    country: country || 'India',
    region: region || '',
    incomeBracket: incomeBracket || 'medium',
    currency: currency || (country === 'India' ? 'INR' : 'USD'),
  });

  // Seed user default categories
  const userCategories = DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    userId: user._id,
  }));
  await Category.insertMany(userCategories);

  // Check initial tax alerts
  await checkUserTaxAlerts(user);

  const token = generateToken(res, user._id, false);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      country: user.country,
      region: user.region,
      incomeBracket: user.incomeBracket,
      currency: user.currency,
      preferences: user.preferences,
    },
  });
});

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken(res, user._id, rememberMe);

  // Trigger alert check
  checkUserTaxAlerts(user).catch(() => {});

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      country: user.country,
      region: user.region,
      incomeBracket: user.incomeBracket,
      currency: user.currency,
      preferences: user.preferences,
    },
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      country: user.country,
      region: user.region,
      incomeBracket: user.incomeBracket,
      currency: user.currency,
      preferences: user.preferences,
    },
  });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email ? email.toLowerCase() : '' });

  if (!user) {
    // For security reasons, still return success message
    return res.json({
      success: true,
      message: 'If that email is registered, password reset instructions have been generated.',
    });
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save({ validateBeforeSave: false });

  // In production, an email would be sent. For this app, return the reset token for seamless testing
  res.json({
    success: true,
    message: 'Password reset token generated. Use this token on the reset password screen.',
    resetToken,
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Token and new password are required' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password has been successfully updated. You can now login.',
  });
});

/**
 * @desc    Demo Login - Instant access to demo user
 * @route   POST /api/auth/demo
 * @access  Public
 */
const demoLogin = asyncHandler(async (req, res) => {
  const demoEmail = 'demo@taxpal.dev';
  let demoUser = await User.findOne({ email: demoEmail });

  if (!demoUser) {
    demoUser = await User.create({
      name: 'Alex Morgan',
      username: 'alexfreelance',
      email: demoEmail,
      password: 'Password123!',
      country: 'United States',
      region: 'California',
      incomeBracket: 'medium',
      currency: 'USD',
      preferences: {
        dateFormat: 'YYYY-MM-DD',
        theme: 'light',
        budgetAlerts: true,
        taxReminders: true,
        monthlySummary: true,
      },
    });

    const categories = DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      userId: demoUser._id,
    }));
    await Category.insertMany(categories);
  }

  const token = generateToken(res, demoUser._id, true);

  res.json({
    success: true,
    message: 'Logged in as Demo User',
    token,
    user: {
      _id: demoUser._id,
      name: demoUser.name,
      username: demoUser.username,
      email: demoUser.email,
      country: demoUser.country,
      region: demoUser.region,
      incomeBracket: demoUser.incomeBracket,
      currency: demoUser.currency,
      preferences: demoUser.preferences,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  forgotPassword,
  resetPassword,
  demoLogin,
};

