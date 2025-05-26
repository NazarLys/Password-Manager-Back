const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ALLOWED_ADMIN_EMAILS = [
  'nazarlys702@gmail.com',
  'Inna.Petrenko@student.wab.edu.pl'
];

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  twoFactorCode: String,
  twoFactorExpires: Date,
  resetToken: String,
  resetTokenExpires: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isSuspended: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 }
});

// Enforce that only certain emails can be admins
userSchema.pre('save', function (next) {
  if (this.isModified('role') && this.role === 'admin') {
    if (!ALLOWED_ADMIN_EMAILS.includes(this.email)) {
      return next(new Error('Only specific accounts can be admins.'));
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
