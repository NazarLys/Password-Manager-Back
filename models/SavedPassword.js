const mongoose = require('mongoose');

const savedPasswordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  label: String, // e.g. account/email
  site: String,  // e.g. site or URL
  encryptedPassword: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedPassword', savedPasswordSchema);
