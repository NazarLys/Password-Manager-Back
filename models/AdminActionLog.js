const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminEmail: { type: String },
  action: { type: String, enum: ['SUSPEND_USER', 'DELETE_USER'] },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetEmail: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminActionLog', actionLogSchema);