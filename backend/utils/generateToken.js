const jwt = require('jsonwebtoken');

// JWT token generate karo aur cookie mein set karo
const generateToken = (res, userId, rememberMe = false) => {
  // remember me pe 30 din, nahi toh 7 din
  const expiresIn = rememberMe ? '30d' : '7d';

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const maxAge = rememberMe ? thirtyDaysMs : sevenDaysMs;

  // JWT secret se token banao
  const jwtSecret = process.env.JWT_SECRET || 'taxpal_secret_jwt_key_2026';
  const token = jwt.sign({ id: userId }, jwtSecret, { expiresIn });

  // cookie mein token set karo (agar response object available hai)
  if (res && res.cookie) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge,
    });
  }

  return token;
};

module.exports = generateToken;
