const mongoose = require('mongoose');

// Budget schema - monthly budget limits ke liye
const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // kis category ka budget hai
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    // budget limit amount
    limit: {
      type: Number,
      required: [true, 'Budget limit amount is required'],
      min: [0, 'Limit cannot be negative'],
    },
    // kis month aur year ka budget hai
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ek user ka ek category ke liye ek month mein sirf ek budget ho sakta hai
budgetSchema.index(
  { userId: 1, categoryId: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model('Budget', budgetSchema);
