const express = require('express');
const router = express.Router();
const playerController = require('../controllers/player.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createPlayerValidator,
  updatePlayerValidator,
} = require('../validators/player.validator');

// Public routes
router.get('/', playerController.getAllPlayers);
router.get('/team/:teamId', playerController.getPlayersByTeam);
router.get('/:id', playerController.getPlayerById);

// Protected routes (super_admin, admin)
router.post(
  '/',
  protect,
  authorize('super_admin', 'admin'),
  createPlayerValidator,
  playerController.createPlayer
);
router.put(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  updatePlayerValidator,
  playerController.updatePlayer
);
router.delete(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  playerController.deletePlayer
);

module.exports = router;
