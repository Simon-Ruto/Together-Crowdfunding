const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { validateRegisterInput, validateLoginInput } = require('../middleware/validation');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// Register
router.post('/register', catchAsync(async (req, res) => {
  const { username, email, password, region, bio } = req.body;

  // Validate input
  const validation = validateRegisterInput({ username, email, password });
  if (!validation.valid) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.errors
      }
    });
  }

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      error: {
        message: 'User already exists',
        code: 'DUPLICATE_USER'
      }
    });
  }

  // Create new user
  user = new User({
    username,
    email,
    password: await bcrypt.hash(password, 10),
    region,
    bio
  });
  await user.save();

  // Generate token
  const payload = { user: { id: user.id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, message: 'User registered successfully' });
}));

// Login
router.post('/login', catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  const validation = validateLoginInput({ email, password });
  if (!validation.valid) {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.errors
      }
    });
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      error: {
        message: 'Invalid credentials',
        code: 'AUTH_ERROR'
      }
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      error: {
        message: 'Invalid credentials',
        code: 'AUTH_ERROR'
      }
    });
  }

  // Generate token
  const payload = { user: { id: user.id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, message: 'Login successful' });
}));

// Forgot password - send reset email with token
router.post('/forgot', catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: {
        message: 'Email is required',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      error: {
        message: 'No user with that email',
        code: 'NOT_FOUND'
      }
    });
  }

  // Generate reset token
  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // Check SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return res.status(500).json({
      error: {
        message: 'Email service not configured',
        code: 'SERVICE_ERROR'
      }
    });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: user.email,
    subject: 'Password reset request',
    text: `You requested a password reset. Visit this link to reset your password: ${resetUrl}`
  });

  res.json({ ok: true, message: 'Reset email sent' });
}));

// Reset password
router.post('/reset', catchAsync(async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({
      error: {
        message: 'Token, email, and password are required',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: {
        message: 'Password must be at least 6 characters',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  const user = await User.findOne({
    email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      error: {
        message: 'Invalid or expired reset token',
        code: 'AUTH_ERROR'
      }
    });
  }

  // Update password
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ ok: true, message: 'Password reset successfully' });
}))

module.exports = router;
