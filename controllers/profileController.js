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
        title: `${userProfile.username} — 3cols`,
        userProfile,
        snippets,
        bookmarked
      });

  } catch (err) {
    console.error(err);
    res.status(500).render('pages/error', { message: err.message });
  }
};