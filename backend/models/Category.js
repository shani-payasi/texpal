const mongoose = require('mongoose');

// Category schema - income/expense categories ke liye
const categorySchema = new mongoose.Schema(
  {
    // userId null matlab system default category hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    // income ya expense category
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Category type must be income or expense'],
    },
    // UI ke liye color aur icon
    color: {
      type: String,
      default: '#4F46E5',
    },
    icon: {
      type: String,
      default: 'tag',
    },
    // kya yeh default category hai
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// fast search ke liye index
categorySchema.index({ userId: 1, type: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);
