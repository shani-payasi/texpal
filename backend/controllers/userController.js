const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Update user profile & preferences
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, username, email, country, region, incomeBracket, currency, preferences } = req.body;

  if (username && username.toLowerCase() !== user.username) {
    const usernameTaken = await User.findOne({ username: username.toLowerCase() });
    if (usernameTaken) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }
    user.username = username.toLowerCase();
  }

  if (email && email.toLowerCase() !== user.email) {
    const emailTaken = await User.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      return res.status(400).json({ success: false, message: 'Email is already taken' });
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (country) user.country = country;
  if (region !== undefined) user.region = region;
  if (incomeBracket) user.incomeBracket = incomeBracket;
  if (currency) user.currency = currency;

  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      country: updatedUser.country,
      region: updatedUser.region,
      incomeBracket: updatedUser.incomeBracket,
      currency: updatedUser.currency,
      preferences: updatedUser.preferences,
    },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

module.exports = {
  updateProfile,
  changePassword,
};

