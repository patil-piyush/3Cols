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
  language: {
    type:    String,
    required:[true, 'Language is required'],
    trim:    true,
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

// Full-text search index
SnippetSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Keep likesCount in sync
SnippetSchema.pre('save', function (next) {
  this.likesCount = this.likes.length;
  next();
});

module.exports = mongoose.model('Snippet', SnippetSchema);
