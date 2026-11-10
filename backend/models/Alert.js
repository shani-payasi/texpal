const mongoose = require('mongoose');

// Alert schema - user notifications ke liye (tax deadline, budget warning etc.)
const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // alert ka type - kis cheez ke liye hai
    type: {
      type: String,
      enum: [
        'tax_deadline',
        'budget_warning',
        'budget_exceeded',
        'high_spending',
        'monthly_summary',
        'system',
      ],
      default: 'system',
    },
    // deadline date (agar applicable ho)
    dueDate: {
      type: Date,
      default: null,
    },
    // user ne padha ya nahi
    isRead: {
      type: Boolean,
      default: false,
    },
    // alert ki current status
    status: {
      type: String,
      enum: ['upcoming', 'due', 'overdue', 'completed'],
      default: 'upcoming',
    },
    // click karne pe kahan jaaye
    actionUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// unread alerts pehle dikhane ke liye index
alertSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
