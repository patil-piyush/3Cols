const jwt  = require('jsonwebtoken');
const User = require('../../models/User');

// ── protectRoute ──────────────────────────────────────────────────────────────
// Hard-blocks unauthenticated users; redirects to login with flash message.
const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.sv_token;
    if (!token) {
      req.flash('error', 'Please log in to continue.');
      return res.redirect('/auth/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.clearCookie('sv_token');
      req.flash('error', 'Session expired. Please log in again.');
      return res.redirect('/auth/login');
    }

    // Make user available in route handlers AND all EJS templates
    req.user       = user;
    res.locals.user = user;
    next();
  } catch (err) {
    res.clearCookie('sv_token');
    req.flash('error', 'Session expired. Please log in again.');
    return res.redirect('/auth/login');
  }
};

// ── loadUser ──────────────────────────────────────────────────────────────────
// Soft-loads the user if a token exists, but doesn't block the request.
// Use this on public pages (landing, browse) so navbar shows avatar if logged in.
const loadUser = async (req, res, next) => {
  try {
    const token = req.cookies.sv_token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');

    if (user) {
      req.user        = user;
      res.locals.user = user;
    }
  } catch (_) {
    // Invalid/expired token — silently ignore on public pages
    res.clearCookie('sv_token');
  }
  next();
};

// ── redirectIfLoggedIn ────────────────────────────────────────────────────────
// Redirects already-authenticated users away from login/register pages.
const redirectIfLoggedIn = (req, res, next) => {
  const token = req.cookies.sv_token;
  if (!token) return next();
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.redirect('/dashboard');
  } catch (_) {
    next();
  }
};

module.exports = { protectRoute, loadUser, redirectIfLoggedIn };
