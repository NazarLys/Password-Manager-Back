const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  twoFactorCode: String,
  twoFactorExpires: Date
});

module.exports = mongoose.model('User', userSchema);
