// Registration ke input validate karo
const validateRegister = (req, res, next) => {
  const { name, username, email, password } = req.body;
  const errors = [];

  // har field check karo
  if (!name || name.trim().length === 0) {
    errors.push('Full name is required');
  }
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Valid email is required');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // agar koi error hai toh 400 bhejo
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

// Login ke input validate karo
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
    });
  }
  next();
};

// Transaction ke input validate karo
const validateTransaction = (req, res, next) => {
  const { type, description, categoryId, amount } = req.body;
  const errors = [];

  // type income ya expense hona chahiye
  if (!type || !['income', 'expense'].includes(type)) {
    errors.push('Type must be income or expense');
  }
  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }
  if (!categoryId) {
    errors.push('Category is required');
  }
  // amount positive number hona chahiye
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    errors.push('Valid positive amount is required');
  }

  // agar koi error hai toh 400 bhejo
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTransaction,
};
