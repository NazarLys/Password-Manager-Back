const mongoose = require('mongoose');

const savedPasswordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  label: String, 
  site: String,  
  encryptedPassword: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedPassword', savedPasswordSchema);
