const Snippet = require('../models/Snippet');
const catchAsync = require('../utils/catchAsync');
const { validationResult } = require('express-validator');

exports.getAllSnippets = catchAsync(async (req, res) => {
  try {
    const search = req.query.search || '';

    let query = { isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const snippets = await Snippet.find(query)
      .skip(skip)
      .limit(limit)
      .populate('author', 'username')
      .lean();

    res.render('pages/snippets', {
      title: 'Browse Snippets - 3cols',
      snippets,
      search
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('pages/error', { message: err.message });
  }
});

// ── GET single snippet ───────────────────────────────────────────
exports.getSnippet = catchAsync(async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('author', 'username');

    if (!snippet) {
      return res.status(404).render('pages/404');
    }

    // increment views
    snippet.views += 1;
    await snippet.save();

    res.render('pages/snippetView', {
      title: snippet.title,
      snippet
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('pages/error', { message: err.message });
  }
});





// ── GET create form ──────────────────────────────────────────────
exports.getCreateSnippet = (req, res) => {
  res.render('pages/snippetForm', {
    title: 'Create Snippet - 3cols'
  });
};

// ── POST create snippet ──────────────────────────────────────────
exports.createSnippet = async (req, res) => {
  try {
    const { title, code, lang, tags } = req.body;

    console.log("REQ BODY:", req.body);
    console.log("LANG VALUE:", lang, typeof lang);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/snippet/new');
    }

    if (!req.user) {
      req.flash('error', 'Please login first');
      return res.redirect('/auth/login');
    }

    const snippet = await Snippet.create({
      title,
      code,
      lang, // ✅ correct field
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [],
      author: req.user._id
    });

    req.flash('success', 'Snippet created successfully 🚀');
    res.redirect(`/snippet/${snippet._id}`);

  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create snippet');
    res.redirect('/dashboard');
  }
};

// ── GET edit snippet ─────────────────────────────────────────────
exports.getEditSnippet = async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (!snippet || (!snippet.isPublic && (!req.user || snippet.author.toString() !== req.user._id.toString()))) {
    return res.status(404).render('pages/404');
  }

  if (!snippet || snippet.author.toString() !== req.user._id.toString()) {
    req.flash('error', 'Unauthorized');
    return res.redirect('/dashboard');
  }

  res.render('pages/snippetForm', {
    title: 'Edit Snippet - 3cols',
    snippet
  });
};

// ── POST update snippet ──────────────────────────────────────────
exports.updateSnippet = async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (!snippet || snippet.author.toString() !== req.user._id.toString()) {
    req.flash('error', 'Unauthorized');
    return res.redirect('/snippets');
  }

  const { title, code, lang, tags } = req.body;

  snippet.title = title;
  snippet.code = code;
  snippet.lang = lang;
  snippet.tags = tags ? tags.split(',').map(t => t.trim().toLowerCase()) : [];

  await snippet.save();

  req.flash('success', 'Snippet updated');
  res.redirect(`/snippet/${snippet._id}`);
};

// ── DELETE snippet ───────────────────────────────────────────────
exports.deleteSnippet = async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (!snippet || snippet.author.toString() !== req.user._id.toString()) {
    req.flash('error', 'Unauthorized');
    return res.redirect('/snippets');
  }

  await snippet.deleteOne();

  req.flash('success', 'Snippet deleted');
  res.redirect('/dashboard');
};

// ── LIKE / UNLIKE ────────────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);

  if (!snippet) return res.redirect('/snippets');

  const userId = req.user._id;

  const alreadyLiked = snippet.likes.some(
    id => id.toString() === userId.toString()
  );

  if (alreadyLiked) {
    snippet.likes.pull(userId);
  } else {
    snippet.likes.push(userId);
  }

  await snippet.save();

  res.redirect(`/snippet/${snippet._id}`);
};


// ── BOOKMARK / UNBOOKMARK ────────────────────────────────────────
exports.toggleBookmark = async (req, res) => {
  try {
    const user = req.user;
    const snippetId = req.params.id;

    const alreadyBookmarked = user.bookmarks.some(
      id => id.toString() === snippetId
    );

    if (alreadyBookmarked) {
      user.bookmarks.pull(snippetId);
    } else {
      user.bookmarks.push(snippetId);
    }

    await user.save();

    res.redirect(`/snippet/${snippetId}`);

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong');
    res.redirect('/dashboard'); 
  }
};