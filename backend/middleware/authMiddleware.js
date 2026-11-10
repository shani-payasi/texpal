const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// protected routes ke liye - user login hai ya nahi check karo
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // pehle cookie mein token check karo
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // agar cookie mein nahi mila toh Authorization header check karo
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // agar token nahi mila toh unauthorized
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    // token verify karo
    const jwtSecret = process.env.JWT_SECRET || 'taxpal_secret_jwt_key_2026';
    const decoded = jwt.verify(token, jwtSecret);

    // user ko find karo (password without)
    req.user = await User.findById(decoded.id).select('-password');

    // agar user delete ho gaya hai
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed or expired',
    });
  }
});

module.exports = { protect };
