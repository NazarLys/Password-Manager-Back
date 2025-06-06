const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AdminActionLog = require('../models/AdminActionLog'); // Only import ONCE
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminAuth');

// Get all users (no password hashes)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  const users = await User.find({}, '-passwordHash');
  res.json(users);
});

// SUSPEND a user
router.patch('/users/:id/suspend', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.userId) {
    return res.status(400).json({ message: "You can't suspend yourself." });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isSuspended = true;
  await user.save();

  await AdminActionLog.create({
    adminId: req.user.userId,
    adminEmail: req.user.email,
    action: 'SUSPEND_USER',
    targetId: user._id,
    targetEmail: user.email
  });

  res.json({ message: `User ${user.email} suspended.` });
});

// UNSUSPEND a user
router.patch('/users/:id/unsuspend', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.userId) {
    return res.status(400).json({ message: "You can't unsuspend yourself." });
  }
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isSuspended = false;
  await user.save();

  await AdminActionLog.create({
    adminId: req.user.userId,
    adminEmail: req.user.email,
    action: 'UNSUSPEND_USER',
    targetId: user._id,
    targetEmail: user.email
  });

  res.json({ message: `User ${user.email} unsuspended.` });
});

// DELETE a user
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.userId) {
    return res.status(400).json({ message: "You can't delete yourself." });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.role === 'admin') {
    return res.status(403).json({ message: "You can't delete another admin." });
  }

  await User.findByIdAndDelete(id);

  await AdminActionLog.create({
    adminId: req.user.userId,
    adminEmail: req.user.email,
    action: 'DELETE_USER',
    targetId: user._id,
    targetEmail: user.email
  });

  res.json({ message: `User ${user.email} deleted.` });
});

// Get all admin action logs (most recent first)
router.get('/logs', authMiddleware, adminMiddleware, async (req, res) => {
  const logs = await AdminActionLog.find().sort({ timestamp: -1 }).limit(200); // limit to latest 200 for performance
  res.json(logs);
});

module.exports = router;
