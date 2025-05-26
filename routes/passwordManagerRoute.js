const express = require('express');
const router = express.Router();
const SavedPassword = require('../models/SavedPassword');
const { encrypt, decrypt } = require('../utils/encryption');
const authMiddleware = require('../middleware/auth');


router.get('/', authMiddleware, async (req, res) => {
  const passwords = await SavedPassword.find({ userId: req.user.userId });
  const decrypted = passwords.map(p => ({
    id: p._id,
    label: p.label,
    site: p.site,
    password: decrypt(p.encryptedPassword)
  }));
  res.json(decrypted);
});


router.post('/', authMiddleware, async (req, res) => {
  const { label, site, password } = req.body;
  const encryptedPassword = encrypt(password);
  const newPassword = new SavedPassword({
    userId: req.user.userId,
    label,
    site,
    encryptedPassword
  });
  await newPassword.save();
  res.status(201).json({
    id: newPassword._id,
    label: newPassword.label,
    site: newPassword.site,
    password
  });
});


router.delete('/:id', authMiddleware, async (req, res) => {
  await SavedPassword.deleteOne({ _id: req.params.id, userId: req.user.userId });
  res.json({ message: 'Password deleted' });
});


router.put('/:id', authMiddleware, async (req, res) => {
  const { label, site, password } = req.body;
  const encryptedPassword = encrypt(password);
  await SavedPassword.updateOne(
    { _id: req.params.id, userId: req.user.userId },
    { $set: { label, site, encryptedPassword } }
  );
  res.json({ message: 'Password updated' });
});

module.exports = router;
