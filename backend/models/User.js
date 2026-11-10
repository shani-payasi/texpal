const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User ka schema - sabhi user details yahan define hain
const userSchema = new mongoose.Schema(
  {
    // basic info
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // password default mein query result mein nahi aayega
    },

    // location aur finance settings
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    region: {
      type: String,
      default: '',
      trim: true,
    },
    incomeBracket: {
      type: String,
      default: 'medium',
      trim: true,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },

    // user ki preferences
    preferences: {
      dateFormat: {
        type: String,
        default: 'YYYY-MM-DD',
      },
      theme: {
        type: String,
        default: 'light',
      },
      budgetAlerts: {
        type: Boolean,
        default: true,
      },
      taxReminders: {
        type: Boolean,
        default: true,
      },
      monthlySummary: {
        type: Boolean,
        default: true,
      },
      financialYearStart: {
        type: String,
        default: 'April',
      },
    },

    // password reset ke liye fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // createdAt aur updatedAt automatically add hoga
  }
);

// save se pehle password hash karo
userSchema.pre('save', async function (next) {
  // agar password change nahi hua toh skip karo
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// password match karo - login ke time use hota hai
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
