const Alert = require('../models/Alert');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get user alerts
 * @route   GET /api/alerts
 * @access  Private
 */
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Alert.countDocuments({ userId: req.user._id, isRead: false });

  res.json({
    success: true,
    unreadCount,
    count: alerts.length,
    alerts,
  });
});

/**
 * @desc    Mark alert as read
 * @route   PUT /api/alerts/:id/read
 * @access  Private
 */
const markAlertAsRead = asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  alert.isRead = true;
  await alert.save();

  res.json({ success: true, message: 'Alert marked as read', alert });
});

/**
 * @desc    Mark all alerts as read
 * @route   PUT /api/alerts/read-all
 * @access  Private
 */
const markAllAlertsAsRead = asyncHandler(async (req, res) => {
  await Alert.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });

  res.json({ success: true, message: 'All alerts marked as read' });
});

/**
 * @desc    Delete alert
 * @route   DELETE /api/alerts/:id
 * @access  Private
 */
const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }

  res.json({ success: true, message: 'Alert dismissed' });
});

module.exports = {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlert,
};

