const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save uploads to the project-level uploads directory (backend/uploads)
    const dest = path.join(__dirname, '..', '..', 'uploads')
    try { fs.mkdirSync(dest, { recursive: true }) } catch(e) { /* ignore */ }
    cb(null, dest)
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, Date.now() + '-' + safeName)
  }
});
const upload = multer({ storage });

// Get my profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update profile (including avatar)
router.put('/me', [auth, upload.single('avatar')], async (req, res) => {
  try {
    const updates = {};
    const fields = ['username', 'region', 'bio'];
    fields.forEach(f => { if (req.body[f]) updates[f] = req.body[f]; });
    if (req.file) {
      console.log('Avatar uploaded:', req.file.filename, req.file.mimetype, req.file.size)
      updates.avatar = '/uploads/' + req.file.filename;
    }
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// public: get user profile by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
