const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const send2FACode = require('../utils/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  router.post('/register', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
  
      // Create new user
      const newUser = new User({ email, passwordHash });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Registration failed' });
    }
  });
  
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      // Generate 6-digit 2FA code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Set code + expiration
      user.twoFactorCode = code;
      user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
  
      // ✅ Send 2FA code via email (this line stays right here)
      await send2FACode(user.email, code);
  
      return res.json({ message: '2FA code sent to email' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Login failed' });
    }
  });

router.post('/verify-2fa', async (req, res) => {
    const { email, code } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Check code and expiration
      if (
        user.twoFactorCode  !== code ||
        !user.twoFactorExpires ||
        new Date() > user.twoFactorExpires
      ) {
        return res.status(401).json({ message: 'Invalid or expired 2FA code' });
      }
  
      // Clear the 2FA code
      user.twoFactorCode  = null;
      user.twoFactorExpires = null;
      await user.save();
  
      // Create JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
module.exports = router;
