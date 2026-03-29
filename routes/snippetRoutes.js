const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/snippetController');
const { protectRoute } = require('../middleware/auth');
const { body } = require('express-validator');

const snippetRules = [
  body('title').notEmpty().withMessage('Title required'),
  body('code').notEmpty().withMessage('Code required'),
  body('lang').notEmpty().withMessage('Language required') // ✅ FIXED
];
// List
router.get('/snippets', ctrl.getAllSnippets);

// Create
router.get('/snippet/new', protectRoute, ctrl.getCreateSnippet);
router.post('/snippet/new', protectRoute, snippetRules, ctrl.createSnippet);

// View
router.get('/snippet/:id', ctrl.getSnippet);

// Edit
router.get('/snippet/edit/:id', protectRoute, ctrl.getEditSnippet);
router.post('/snippet/edit/:id', protectRoute, snippetRules, ctrl.updateSnippet);

// Delete
router.post('/snippet/delete/:id', protectRoute, ctrl.deleteSnippet);

// Like
router.get('/snippet/like/:id', protectRoute, ctrl.toggleLike);
// Bookmark
router.get('/snippet/bookmark/:id', protectRoute, ctrl.toggleBookmark);

module.exports = router;