const express           = require('express');
const router            = express.Router();
const { protectRoute, loadUser } = require('../middleware/auth');

// Landing — soft load user so navbar shows avatar if logged in
router.get('/', loadUser, (req, res) => {
  res.render('pages/landing', {
    title: '3cols — Your Personal Code Library'
  });
});

// Dashboard placeholder (Phase 7)
router.get('/dashboard', protectRoute, (req, res) => {
  res.render('pages/dashboard', { title: 'Dashboard — 3cols' });
});

module.exports = router;
