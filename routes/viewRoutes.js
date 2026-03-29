const express           = require('express');
const router            = express.Router();
const { protectRoute, loadUser } = require('../public/js/auth');

// Landing — soft load user so navbar shows avatar if logged in
router.get('/', loadUser, (req, res) => {
  res.render('pages/landing', {
    title: 'SnippetVault — Your Personal Code Library',
  });
});

// Dashboard placeholder (Phase 7)
router.get('/dashboard', protectRoute, (req, res) => {
  res.render('pages/dashboard', { title: 'Dashboard — SnippetVault' });
});

module.exports = router;
