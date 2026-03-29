const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const ctrl     = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/auth');

// Validation rules — reusable
const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters.')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required.').isEmail().withMessage('Invalid email.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

// GET  /auth/register
router.get('/register', redirectIfLoggedIn, ctrl.getRegister);
// POST /auth/register
router.post('/register', redirectIfLoggedIn, registerRules, ctrl.postRegister);

// GET  /auth/login
router.get('/login', redirectIfLoggedIn, ctrl.getLogin);
// POST /auth/login
router.post('/login', redirectIfLoggedIn, loginRules, ctrl.postLogin);

// GET  /auth/logout
router.get('/logout', ctrl.logout);

module.exports = router;
