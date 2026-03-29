const jwt              = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User             = require('../models/User');

// Cookie config — reused for set and clear
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
};

// Helper: sign a JWT for userId
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── GET /auth/register ────────────────────────────────────────────────────────
exports.getRegister = (req, res) => {
  res.render('pages/auth/register', { title: 'Sign Up — SnippetVault' });
};

// ── POST /auth/register ───────────────────────────────────────────────────────
exports.postRegister = async (req, res) => {
  // Validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/register');
  }

  const { username, email, password } = req.body;

  try {
    // Check duplicates with friendly messages
    const existingEmail    = await User.findOne({ email:    email.toLowerCase() });
    const existingUsername = await User.findOne({ username: username });

    if (existingEmail) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/auth/register');
    }
    if (existingUsername) {
      req.flash('error', 'That username is already taken. Try another.');
      return res.redirect('/auth/register');
    }

    const user  = await User.create({ username, email, password });
    const token = signToken(user._id);

    res.cookie('sv_token', token, COOKIE_OPTS);
    req.flash('success', `Welcome to SnippetVault, ${user.username}! 🎉`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Register error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/register');
  }
};

// ── GET /auth/login ───────────────────────────────────────────────────────────
exports.getLogin = (req, res) => {
  res.render('pages/auth/login', { title: 'Log In — SnippetVault' });
};

// ── POST /auth/login ──────────────────────────────────────────────────────────
exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/login');
  }

  const { email, password } = req.body;

  try {
    // Explicitly select password (schema has select:false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    const token = signToken(user._id);
    res.cookie('sv_token', token, COOKIE_OPTS);
    req.flash('success', `Welcome back, ${user.username}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Something went wrong. Please try again.');
    res.redirect('/auth/login');
  }
};

// ── GET /auth/logout ──────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie('sv_token');
  req.flash('success', 'You have been logged out.');
  res.redirect('/');
};
