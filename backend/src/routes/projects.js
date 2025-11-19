const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Update = require('../models/Update');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '..', '..', 'uploads')
    try {
      fs.mkdirSync(dest, { recursive: true })
    } catch (e) {
      // ignore
    }
    cb(null, dest)
  },
  filename: (req, file, cb) => {
    // sanitize filename to avoid problematic characters
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, Date.now() + '-' + safeName)
  }
});
const upload = multer({ storage });

// Create project (handle multer errors explicitly and log incoming data)
router.post('/', auth, (req, res) => {
  // run multer upload and catch any multer errors
  upload.array('media', 6)(req, res, async function(err) {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ message: err.message });
    }
    try {
      console.log('Create project req.body:', req.body);
      console.log('Create project files count:', (req.files || []).length);
      (req.files || []).forEach(f => console.log(' -', f.filename, f.mimetype, f.size));

      const { title, description, goal, region, callToAction } = req.body;
      if (!title || !description || !goal) return res.status(400).json({ message: 'Title, description and goal are required' });
      const images = [];
      const videos = [];
      (req.files || []).forEach(f => {
        const p = '/uploads/' + f.filename;
        if (f.mimetype.startsWith('image')) images.push(p); else videos.push(p);
      });
  const project = new Project({ title, description, goal, owner: req.user.id, images, videos, region, callToAction });
  await project.save();
  const projObj = project.toObject();
  projObj.media = (projObj.images || []).concat(projObj.videos || []);
  res.json(projObj);
    } catch (err) {
      console.error('Create project error:', err);
      res.status(500).send('Server error');
    }
  })
});

// Import a starter sample project for development (authenticated)
router.post('/import-sample', auth, async (req, res) => {
  try {
    const sample = {
      title: 'Sample Project (Imported)',
      description: 'This project was imported from the sample set for local testing.',
      goal: 1000,
      owner: req.user.id,
      images: [],
      videos: [],
      region: 'Local',
      callToAction: 'Support our sample project'
    }
    const project = new Project(sample)
    await project.save()
    res.json(project)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// List projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('owner', 'username avatar region');
    // attach combined media array for frontend compatibility
    const out = projects.map(p => {
      const o = p.toObject();
      o.media = (o.images || []).concat(o.videos || []);
      return o;
    });
    res.json(out);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get project detail including updates
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Project not found' });
  const project = await Project.findById(req.params.id).populate('owner', 'username avatar region');
    if (!project) return res.status(404).json({ message: 'Project not found' });
  const updates = await Update.find({ project: project.id }).populate('author', 'username avatar').sort({ createdAt: -1 });
  const po = project.toObject();
  po.media = (po.images || []).concat(po.videos || []);
  res.json({ project: po, updates });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Simple fund endpoint (increment collected)
router.post('/:id/fund', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Project not found' });
    const { amount } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.collected += Number(amount || 0);
    if (project.collected >= project.goal) project.isFunded = true;
    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add update to project (owner only)
router.post('/:id/updates', auth, upload.array('media', 6), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Project not found' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    const images = [];
    const videos = [];
    (req.files || []).forEach(f => {
      const p = '/uploads/' + f.filename;
      if (f.mimetype.startsWith('image')) images.push(p); else videos.push(p);
    });
  const update = new Update({ project: project.id, title: req.body.title, message: req.body.message, images, videos, author: req.user.id });
  await update.save();
  const uo = update.toObject();
  uo.media = (uo.images || []).concat(uo.videos || []);
  res.json(uo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update project (owner only) - supports updating fields and uploading new media
router.put('/:id', auth, (req, res) => {
  upload.array('media', 6)(req, res, async function(err) {
    if (err) {
      console.error('Multer upload error (update):', err);
      return res.status(400).json({ message: err.message });
    }
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ message: 'Project not found' });
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: 'Project not found' });
      if (project.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

      // update scalar fields if provided
      const { title, description, goal, region, callToAction, removeImages } = req.body;
      if (title) project.title = title;
      if (description) project.description = description;
      if (goal) project.goal = Number(goal);
      if (region) project.region = region;
      if (callToAction) project.callToAction = callToAction;

      // handle removed images (array of paths)
      if (removeImages) {
        try {
          const toRemove = Array.isArray(removeImages) ? removeImages : JSON.parse(removeImages);
          project.images = (project.images || []).filter(img => !toRemove.includes(img));
        } catch (e) {
          // ignore parse errors
        }
      }

      // handle new uploaded media
      const images = [];
      const videos = [];
      (req.files || []).forEach(f => {
        const p = '/uploads/' + f.filename;
        if (f.mimetype.startsWith('image')) images.push(p); else videos.push(p);
      });

      // If the client provided an `images` array (new desired order for existing images),
      // use that as the base ordering and then append any newly uploaded image paths.
      if (req.body.images) {
        try {
          const provided = Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images);
          // ensure it's an array of strings
          const base = Array.isArray(provided) ? provided.map(String) : [];
          // Append newly uploaded images that aren't already in base
          project.images = base.concat(images.filter(p => !base.includes(p)));
        } catch (e) {
          // if parsing fails, fall back to existing behavior
          if (images.length) project.images = images.concat(project.images || []);
        }
      } else {
        // prepend new images so they become primary (legacy behavior)
        if (images.length) project.images = images.concat(project.images || []);
      }

      if (videos.length) project.videos = videos.concat(project.videos || []);

      await project.save();
      const po = project.toObject();
      po.media = (po.images || []).concat(po.videos || []);
      res.json(po);
    } catch (err) {
      console.error('Update project error:', err);
      res.status(500).send('Server error');
    }
  })
});

// Delete project (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: {
          message: 'Invalid project ID',
          code: 'INVALID_ID'
        }
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        error: {
          message: 'Project not found',
          code: 'NOT_FOUND'
        }
      });
    }

    // Check ownership
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        error: {
          message: 'Not authorized to delete this project',
          code: 'FORBIDDEN'
        }
      });
    }

    // Delete associated files from uploads directory
    const allMedia = (project.images || []).concat(project.videos || []);
    allMedia.forEach(mediaPath => {
      if (mediaPath.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', '..', mediaPath);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.warn(`Could not delete file ${filePath}:`, err.message);
        }
      }
    });

    // Delete associated updates
    await Update.deleteMany({ project: project._id });

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({ 
      ok: true, 
      message: 'Project deleted successfully' 
    });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({
      error: {
        message: 'Error deleting project',
        code: 'SERVER_ERROR'
      }
    });
  }
});

module.exports = router;
