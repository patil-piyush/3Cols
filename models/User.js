const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type:      String,
    required:  [true, 'Username is required'],
    unique:    true,
    trim:      true,
    minlength: [3,  'Username must be at least 3 characters'],
    maxlength: [20, 'Username must be at most 20 characters'],
    match:     [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
  },
  email: {
    type:      String,
    required:  [true, 'Email is required'],
    unique:    true,
    trim:      true,
    lowercase: true,
    match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select:    false,
  },
  bio: {
    type:      String,
    maxlength: [200, 'Bio must be at most 200 characters'],
    default:   '',
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Snippet',
  }],
}, { timestamps: true });


// 🔥 FIXED PRE-SAVE (IMPORTANT)
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Compare password
UserSchema.methods.matchPassword = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);