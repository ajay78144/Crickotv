const express = require('express');
const router = express.Router();
const overlayController = require('../controllers/overlay.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public: GET overlay settings (OBS overlays and public frontend read this)
router.get('/:matchId', overlayController.getOverlaySetting);

// Protected: PUT overlay settings (super_admin, admin, scorer)
router.put(
  '/:matchId',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  overlayController.updateOverlaySetting
);

module.exports = router;
