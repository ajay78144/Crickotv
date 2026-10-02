const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public
router.get('/', sponsorController.getSponsors);

// Protected (super_admin, admin)
router.post(
  '/',
  protect,
  authorize('super_admin', 'admin'),
  sponsorController.createSponsor
);
router.put(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  sponsorController.updateSponsor
);
router.delete(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  sponsorController.deleteSponsor
);

module.exports = router;
