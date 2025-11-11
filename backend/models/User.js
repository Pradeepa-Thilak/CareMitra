const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firebaseUID: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);