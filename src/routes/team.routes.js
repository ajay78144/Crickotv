const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createTeamValidator,
  updateTeamValidator,
} = require('../validators/team.validator');

// Public routes
router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeamById);

// Protected routes (super_admin, admin)
router.post(
  '/',
  protect,
  authorize('super_admin', 'admin'),
  createTeamValidator,
  teamController.createTeam
);
router.put(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  updateTeamValidator,
  teamController.updateTeam
);
router.delete(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  teamController.deleteTeam
);

module.exports = router;
