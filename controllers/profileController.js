const User = require('../models/User');
const Snippet = require('../models/Snippet');

// ── GET user profile ─────────────────────────────────────────────
exports.getUserProfile = async (req, res) => {
  try {
    const username = req.params.username.toLowerCase();

    const userProfile = await User.findOne({ username });

    if (!userProfile) {
      return res.status(404).render('pages/404');
    }

    const snippets = await Snippet.find({
      author: userProfile._id,
      isPublic: true
    }).lean();

    const bookmarked = await Snippet.find({
      _id: { $in: userProfile.bookmarks }
    }).lean();

    res.render('pages/profile', {
      title: `${userProfile.username} - 3cols`,
      userProfile,
      snippets,
      bookmarked
    });

  } catch (err) {
    console.error(err);
    res.status(500).render('pages/error', { message: err.message });
  }
};



exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total snippets
    const totalSnippets = await Snippet.countDocuments({ author: userId });

    // Total likes (sum of likesCount)
    const snippets = await Snippet.find({ author: userId });

    const totalLikes = snippets.reduce((sum, s) => sum + (s.likesCount || 0), 0);

    // Total views
    const totalViews = snippets.reduce((sum, s) => sum + (s.views || 0), 0);

    // Bookmarks (from user model)
    const bookmarks = req.user.bookmarks ? req.user.bookmarks.length : 0;

    // Recent snippets
    const recentSnippets = await Snippet.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('pages/dashboard', {
      title: 'Dashboard - 3cols',
      totalSnippets,
      totalLikes,
      totalViews,
      bookmarks,
      recentSnippets
    });

  } catch (err) {
    console.error(err);
    res.render('pages/dashboard', {
      title: 'Dashboard - 3cols',
      totalSnippets: 0,
      totalLikes: 0,
      totalViews: 0,
      bookmarks: 0,
      recentSnippets: []
    });
  }
};