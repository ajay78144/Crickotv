const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournament.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', tournamentController.getAllTournaments);
router.get('/:id', tournamentController.getTournamentById);

// Protected routes (super_admin, admin)
router.post(
  '/',
  protect,
  authorize('super_admin', 'admin'),
  tournamentController.createTournament
);
router.put(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  tournamentController.updateTournament
);
router.delete(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  tournamentController.deleteTournament
);

module.exports = router;
