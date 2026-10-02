const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const scoringController = require('../controllers/scoring.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createMatchValidator,
  playingXIValidator,
  tossValidator,
  startMatchValidator,
  selectBatsmanValidator,
  selectBowlerValidator,
} = require('../validators/match.validator');
const { recordDeliveryValidator } = require('../validators/delivery.validator');

// Public match routes
router.get('/', matchController.getMatches);
router.get('/live', matchController.getLiveMatches);
router.get('/upcoming', matchController.getUpcomingMatches);
router.get('/completed', matchController.getCompletedMatches);
router.get('/:id', matchController.getMatchById);

// Public live score, scorecard, and commentary routes
router.get('/:id/live', matchController.getLiveScore);
router.get('/:id/scorecard', matchController.getScorecard);
router.get('/:id/commentary', matchController.getCommentary);

// Protected match management routes (super_admin, admin)
router.post(
  '/',
  protect,
  authorize('super_admin', 'admin'),
  createMatchValidator,
  matchController.createMatch
);
router.put(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  matchController.updateMatch
);
router.delete(
  '/:id',
  protect,
  authorize('super_admin', 'admin'),
  matchController.deleteMatch
);

// Protected match flow & setup routes (super_admin, admin, scorer)
router.post(
  '/:id/playing-xi',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  playingXIValidator,
  matchController.setPlayingXI
);

router.post(
  '/:id/toss',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  tossValidator,
  matchController.recordToss
);

router.post(
  '/:id/start',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  startMatchValidator,
  matchController.startMatch
);

router.post(
  '/:id/start-second-innings',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  startMatchValidator,
  matchController.startSecondInnings
);

// Protected scoring & delivery routes (super_admin, admin, scorer)
router.post(
  '/:id/delivery',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  recordDeliveryValidator,
  scoringController.recordDelivery
);

router.post(
  '/:id/select-batsman',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  selectBatsmanValidator,
  scoringController.selectBatsman
);

router.post(
  '/:id/select-bowler',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  selectBowlerValidator,
  scoringController.selectBowler
);

router.post(
  '/:id/undo',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  scoringController.undoDelivery
);

router.put(
  '/:id/deliveries/:deliveryId',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  recordDeliveryValidator,
  scoringController.editDelivery
);

router.post(
  '/:id/end-innings',
  protect,
  authorize('super_admin', 'admin', 'scorer'),
  scoringController.endInnings
);

module.exports = router;
