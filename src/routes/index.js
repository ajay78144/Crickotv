const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const teamRoutes = require('./team.routes');
const playerRoutes = require('./player.routes');
const tournamentRoutes = require('./tournament.routes');
const matchRoutes = require('./match.routes');
const sponsorRoutes = require('./sponsor.routes');
const overlayRoutes = require('./overlay.routes');
const broadcastRoutes = require('../broadcast/routes');

// Real-time broadcast and desk API endpoints
router.use('/', broadcastRoutes);

// Detailed entity APIs
router.use('/auth', authRoutes);
router.use('/teams', teamRoutes);
router.use('/players', playerRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/matches', matchRoutes);
router.use('/sponsors', sponsorRoutes);
router.use('/overlay-settings', overlayRoutes);

module.exports = router;
