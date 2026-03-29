const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Load user if token exists
exports.loadUser = async (req, res, next) => {
  try {
    const token = req.cookies.sv_token; // ✅ FIXED

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
      res.locals.user = user;
    }

    next();
  } catch (err) {
    res.clearCookie('sv_token'); // ✅ optional safety
    next();
  }
};

// Protect route
exports.protectRoute = (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'Please log in first.');
    return res.redirect('/auth/login');
  }
  next();
};

// Redirect if logged in
exports.redirectIfLoggedIn = (req, res, next) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  next();
};