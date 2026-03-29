const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema({
  title: {
    type:      String,
    required:  [true, 'Title is required'],
    trim:      true,
    maxlength: [100, 'Title must be at most 100 characters'],
  },

  description: {
    type:      String,
    trim:      true,
    maxlength: [500, 'Description must be at most 500 characters'],
    default:   '',
  },

  code: {
    type:     String,
    required: [true, 'Code is required'],
  },

  // ✅ FIXED: use lang consistently
  lang: {
    type:      String,
    required:  [true, 'Language is required'],
    trim:      true,
    lowercase: true,
  },

  tags: [{
    type:      String,
    trim:      true,
    lowercase: true,
    maxlength: 30,
  }],

  author: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  }],

  likesCount: {
    type:    Number,
    default: 0,
  },

  isPublic: {
    type:    Boolean,
    default: true,
  },

  views: {
    type:    Number,
    default: 0,
  },

}, { timestamps: true });


// ✅ FIXED: prevent Mongo language conflict
SnippetSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { default_language: 'english' }
);


// ✅ FIXED: modern middleware (no next)
SnippetSchema.pre('save', function () {
  this.likesCount = this.likes ? this.likes.length : 0;
});


module.exports = mongoose.model('Snippet', SnippetSchema);