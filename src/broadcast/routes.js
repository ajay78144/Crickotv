const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const engine = require('./engine');
const { PRESET_TEAMS } = require('./presets');
const socketService = require('../services/socket.service');

// Configure Multer for uploads
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `img_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// GET /api/match - returns current active MatchState
router.get('/match', (req, res) => {
  return res.json({
    success: true,
    data: engine.getState(),
  });
});

// POST /api/match/new - starts a fresh match
router.post('/match/new', (req, res) => {
  try {
    const state = engine.startNewMatch(req.body || {});
    const io = socketService.getSocketIO();
    if (io) {
      io.emit('match:update', state);
      io.emit('match:rule_alert', {
        type: 'info',
        title: 'New Match Started',
        message: state.title,
      });
    }
    return res.status(201).json({
      success: true,
      message: 'New match started successfully',
      data: state,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

// POST /api/reset - resets match to clean initial default
router.post('/reset', (req, res) => {
  const state = engine.reset();
  const io = socketService.getSocketIO();
  if (io) {
    io.emit('match:update', state);
  }
  return res.json({
    success: true,
    message: 'Match reset to initial default',
    data: state,
  });
});

// GET /api/presets - returns all preset squads (IND, AUS, PAK, ENG, CSK, MI, etc.)
router.get('/presets', (req, res) => {
  return res.json({
    success: true,
    data: PRESET_TEAMS,
  });
});

// POST /api/upload - image uploads for player photos & team flags
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file uploaded',
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename,
  });
});

module.exports = router;
