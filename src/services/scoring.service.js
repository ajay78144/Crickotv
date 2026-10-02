const Match = require('../models/Match');
const Innings = require('../models/Innings');
const Delivery = require('../models/Delivery');
const Player = require('../models/Player');
const AuditLog = require('../models/AuditLog');
const {
  ballsToOvers,
  calculateRunRate,
  calculateRequiredRunRate,
  calculateTarget,
  determineMatchResult,
  generateCommentary,
} = require('../utils/cricketRules');
const socketService = require('./socket.service');
const scorecardService = require('./scorecard.service');

/**
 * Record a single ball delivery
 */
const recordDelivery = async (matchId, deliveryData, userId = null) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  if (match.status !== 'live') {
    throw new Error(`Cannot record delivery when match status is '${match.status}'`);
  }

  const inningsNumber = match.currentInnings;
  const innings = await Innings.findOne({ matchId: match._id, inningsNumber });
  if (!innings || innings.status !== 'live') {
    throw new Error(`Innings ${inningsNumber} is not active`);
  }

  // Check batsman and bowler presence
  if (!innings.strikerId || !innings.nonStrikerId) {
    throw new Error('Both striker and non-striker must be selected before recording delivery');
  }

  if (!innings.currentBowlerId) {
    throw new Error('Bowler must be selected before recording delivery');
  }

  // Count active deliveries to determine sequence
  const currentCount = await Delivery.countDocuments({
    matchId: match._id,
    inningsId: innings._id,
    isUndone: false,
  });

  const nextSequence = currentCount + 1;

  // Concurrency protection check
  if (
    deliveryData.expectedSequence !== undefined &&
    deliveryData.expectedSequence !== null &&
    deliveryData.expectedSequence !== nextSequence
  ) {
    const err = new Error(
      `Sequence conflict: Expected sequence ${deliveryData.expectedSequence} but server expects ${nextSequence}`
    );
    err.statusCode = 409;
    throw err;
  }

  // Extract inputs
  let runsOffBat = parseInt(deliveryData.runsOffBat, 10) || 0;
  const extraType = deliveryData.extraType || null;
  let extraRuns = parseInt(deliveryData.extraRuns, 10) || 0;
  const isWicket = Boolean(deliveryData.isWicket);
  const wicketType = deliveryData.wicketType || null;
  let dismissedPlayerId = deliveryData.dismissedPlayerId || null;
  const fielderId = deliveryData.fielderId || null;
  const runsCompleted = parseInt(deliveryData.runsCompleted, 10) || 0;

  // Determine legality and free hit
  const isFreeHit = innings.isFreeHit;
  let isLegalDelivery = true;
  let nextIsFreeHit = false;

  if (extraType === 'wide') {
    isLegalDelivery = false;
    extraRuns = extraRuns > 0 ? extraRuns : 1;
    runsOffBat = 0; // In standard cricket, runs on wide ball are extras
  } else if (extraType === 'no_ball') {
    isLegalDelivery = false;
    extraRuns = extraRuns > 0 ? extraRuns : 1;
    nextIsFreeHit = true; // No ball causes free hit on next ball
  } else if (extraType === 'penalty') {
    isLegalDelivery = false;
    extraRuns = extraRuns > 0 ? extraRuns : 5;
    runsOffBat = 0;
  } else if (extraType === 'bye' || extraType === 'leg_bye') {
    isLegalDelivery = true;
    extraRuns = extraRuns > 0 ? extraRuns : 1;
    runsOffBat = 0;
  }

  // Free hit restriction: only run_out and retired_out are dismissals on free hit
  if (isFreeHit && isWicket) {
    if (wicketType !== 'run_out' && wicketType !== 'retired_out') {
      throw new Error(`Batsman cannot be dismissed as '${wicketType}' on a Free Hit`);
    }
  }

  // If wide or no-ball was bowled on a free hit, free hit carries over!
  if (isFreeHit && !isLegalDelivery) {
    nextIsFreeHit = true;
  }

  const totalRuns = runsOffBat + extraRuns;

  // Calculate over number and ball number
  const legalBallsBefore = innings.legalBalls;
  const overNumber = Math.floor(legalBallsBefore / 6);
  const ballNumber = isLegalDelivery ? (legalBallsBefore % 6) + 1 : (legalBallsBefore % 6) || 6;

  // Lookup player names for commentary
  const [striker, bowler, nonStriker, dismissedPlayer, fielder] = await Promise.all([
    Player.findById(innings.strikerId),
    Player.findById(innings.currentBowlerId),
    Player.findById(innings.nonStrikerId),
    dismissedPlayerId ? Player.findById(dismissedPlayerId) : null,
    fielderId ? Player.findById(fielderId) : null,
  ]);

  if (isWicket && !dismissedPlayerId) {
    dismissedPlayerId = innings.strikerId;
  }

  const commentaryText = generateCommentary({
    strikerName: striker?.name || 'Striker',
    bowlerName: bowler?.name || 'Bowler',
    runsOffBat,
    extraType,
    extraRuns,
    isWicket,
    wicketType,
    dismissedPlayerName: dismissedPlayer?.name || striker?.name,
    fielderName: fielder?.name,
  });

  // Save delivery
  const delivery = await Delivery.create({
    matchId: match._id,
    inningsId: innings._id,
    inningsNumber,
    sequence: nextSequence,
    overNumber,
    ballNumber,
    strikerId: innings.strikerId,
    nonStrikerId: innings.nonStrikerId,
    bowlerId: innings.currentBowlerId,
    runsOffBat,
    extraRuns,
    extraType,
    totalRuns,
    isLegalDelivery,
    isWicket,
    wicketType,
    dismissedPlayerId,
    fielderId,
    runsCompleted,
    isFreeHit,
    commentary: commentaryText,
    isUndone: false,
    createdBy: userId,
  });

  // Update innings score and extras
  innings.runs += totalRuns;

  if (extraType === 'wide') {
    innings.extras.wides += extraRuns;
  } else if (extraType === 'no_ball') {
    innings.extras.noBalls += extraRuns;
  } else if (extraType === 'bye') {
    innings.extras.byes += extraRuns;
  } else if (extraType === 'leg_bye') {
    innings.extras.legByes += extraRuns;
  } else if (extraType === 'penalty') {
    innings.extras.penalty += extraRuns;
  }

  if (isLegalDelivery) {
    innings.legalBalls += 1;
  }

  innings.isFreeHit = nextIsFreeHit;

  // Update wicket count
  if (isWicket) {
    innings.wickets += 1;
    if (dismissedPlayerId.toString() === innings.strikerId.toString()) {
      innings.strikerId = null; // Scorer must select new batsman
    } else if (dismissedPlayerId.toString() === innings.nonStrikerId.toString()) {
      innings.nonStrikerId = null; // Scorer must select new non-striker
    }
  }

  // Strike rotation logic
  // Determine if strike rotated during running
  let strikeSwap = false;
  if (runsOffBat % 2 === 1) {
    strikeSwap = !strikeSwap;
  }
  if ((extraType === 'bye' || extraType === 'leg_bye') && extraRuns % 2 === 1) {
    strikeSwap = !strikeSwap;
  }
  if (extraType === 'wide' && runsCompleted % 2 === 1) {
    strikeSwap = !strikeSwap;
  }

  if (strikeSwap && innings.strikerId && innings.nonStrikerId) {
    const temp = innings.strikerId;
    innings.strikerId = innings.nonStrikerId;
    innings.nonStrikerId = temp;
  }

  // End of over check
  let isOverEnd = false;
  if (isLegalDelivery && innings.legalBalls % 6 === 0) {
    isOverEnd = true;
    innings.isOverComplete = true;
    innings.previousBowlerId = innings.currentBowlerId;
    innings.currentBowlerId = null; // require selecting bowler for next over

    // Swap strike at the end of the over
    if (innings.strikerId && innings.nonStrikerId) {
      const temp = innings.strikerId;
      innings.strikerId = innings.nonStrikerId;
      innings.nonStrikerId = temp;
    }
  } else {
    innings.isOverComplete = false;
  }

  // Check innings and match conclusion
  let inningsEnded = false;
  let matchEnded = false;

  const maxBalls = match.totalOvers * 6;

  if (inningsNumber === 1) {
    if (innings.legalBalls >= maxBalls || innings.wickets >= 10) {
      innings.status = 'completed';
      inningsEnded = true;
      match.status = 'innings_break';
    }
  } else if (inningsNumber === 2) {
    const target = innings.target;
    // Check target chased
    if (innings.runs >= target) {
      innings.status = 'completed';
      inningsEnded = true;
      matchEnded = true;
      match.status = 'completed';
      match.completedAt = new Date();

      const populatedMatch = await Match.findById(match._id)
        .populate('teamA', 'name shortName')
        .populate('teamB', 'name shortName');

      const outcome = determineMatchResult({
        innings1Runs: target - 1,
        innings2Runs: innings.runs,
        innings2Wickets: innings.wickets,
        target,
        totalOvers: match.totalOvers,
        legalBallsInnings2: innings.legalBalls,
        battingTeam2: populatedMatch.teamB._id.equals(innings.battingTeamId)
          ? populatedMatch.teamB
          : populatedMatch.teamA,
        bowlingTeam2: populatedMatch.teamA._id.equals(innings.bowlingTeamId)
          ? populatedMatch.teamA
          : populatedMatch.teamB,
      });

      match.winner = outcome.winner;
      match.result = outcome.result;
    } else if (innings.legalBalls >= maxBalls || innings.wickets >= 10) {
      // Overs completed or all out without reaching target
      innings.status = 'completed';
      inningsEnded = true;
      matchEnded = true;
      match.status = 'completed';
      match.completedAt = new Date();

      const populatedMatch = await Match.findById(match._id)
        .populate('teamA', 'name shortName')
        .populate('teamB', 'name shortName');

      const outcome = determineMatchResult({
        innings1Runs: target - 1,
        innings2Runs: innings.runs,
        innings2Wickets: innings.wickets,
        target,
        totalOvers: match.totalOvers,
        legalBallsInnings2: innings.legalBalls,
        battingTeam2: populatedMatch.teamB._id.equals(innings.battingTeamId)
          ? populatedMatch.teamB
          : populatedMatch.teamA,
        bowlingTeam2: populatedMatch.teamA._id.equals(innings.bowlingTeamId)
          ? populatedMatch.teamA
          : populatedMatch.teamB,
      });

      match.winner = outcome.winner;
      match.result = outcome.result;
    }
  }

  await innings.save();
  await match.save();

  // Audit log
  if (userId) {
    await AuditLog.create({
      userId,
      action: 'delivery_added',
      entityType: 'Delivery',
      entityId: delivery._id,
      matchId: match._id,
      newValue: delivery.toObject(),
    });
  }

  // Get normalized live score data and emit via socket
  const liveData = await scorecardService.getLiveMatchData(match._id);
  socketService.emitScoreUpdate(match._id, liveData);

  if (isWicket) {
    socketService.emitWicket(match._id, {
      delivery,
      dismissedPlayerId,
      wicketType,
      score: liveData.score,
    });
  }

  if (matchEnded) {
    socketService.emitMatchEnd(match._id, {
      winner: match.winner,
      result: match.result,
      score: liveData.score,
    });
  } else if (inningsEnded) {
    socketService.emitInningsEnd(match._id, {
      inningsNumber,
      score: liveData.score,
      target: innings.runs + 1,
    });
  }

  return {
    delivery,
    innings,
    match,
    liveData,
  };
};

/**
 * Select Batsman (e.g. after wicket or at innings start)
 */
const selectBatsman = async (matchId, playerId, userId = null) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const innings = await Innings.findOne({
    matchId: match._id,
    inningsNumber: match.currentInnings,
  });
  if (!innings) throw new Error('Active innings not found');

  // Verify player belongs to batting team
  const player = await Player.findOne({ _id: playerId, teamId: innings.battingTeamId });
  if (!player) {
    throw new Error('Selected player must belong to the batting team');
  }

  // Check playing XI
  const playingXIs = [...(match.playingXI?.teamA || []), ...(match.playingXI?.teamB || [])].map((id) =>
    id.toString()
  );
  if (!playingXIs.includes(playerId.toString())) {
    throw new Error('Player must be in the playing XI');
  }

  // Check if player is already on crease
  if (
    innings.strikerId?.toString() === playerId.toString() ||
    innings.nonStrikerId?.toString() === playerId.toString()
  ) {
    throw new Error('Player is already batting on the crease');
  }

  // Check if batsman was already dismissed in this innings
  const alreadyDismissed = await Delivery.findOne({
    matchId: match._id,
    inningsId: innings._id,
    isUndone: false,
    isWicket: true,
    dismissedPlayerId: playerId,
  });
  if (alreadyDismissed) {
    throw new Error('Dismissed batsman cannot bat again in this innings');
  }

  if (!innings.strikerId) {
    innings.strikerId = playerId;
  } else if (!innings.nonStrikerId) {
    innings.nonStrikerId = playerId;
  } else {
    throw new Error('Both striker and non-striker are already set');
  }

  await innings.save();

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'batsman_selected',
      entityType: 'Innings',
      entityId: innings._id,
      matchId: match._id,
      newValue: { strikerId: innings.strikerId, nonStrikerId: innings.nonStrikerId },
    });
  }

  const liveData = await scorecardService.getLiveMatchData(match._id);
  socketService.emitScoreUpdate(match._id, liveData);

  return { innings, liveData };
};

/**
 * Select Bowler (e.g. at over change)
 */
const selectBowler = async (matchId, playerId, userId = null) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const innings = await Innings.findOne({
    matchId: match._id,
    inningsNumber: match.currentInnings,
  });
  if (!innings) throw new Error('Active innings not found');

  // Verify player belongs to bowling team
  const player = await Player.findOne({ _id: playerId, teamId: innings.bowlingTeamId });
  if (!player) {
    throw new Error('Selected player must belong to the bowling team');
  }

  // Cannot bowl consecutive overs
  if (
    innings.previousBowlerId &&
    innings.previousBowlerId.toString() === playerId.toString() &&
    innings.legalBalls > 0
  ) {
    throw new Error('Bowler cannot bowl two consecutive overs');
  }

  innings.currentBowlerId = playerId;
  innings.isOverComplete = false;
  await innings.save();

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'bowler_selected',
      entityType: 'Innings',
      entityId: innings._id,
      matchId: match._id,
      newValue: { currentBowlerId: playerId },
    });
  }

  const liveData = await scorecardService.getLiveMatchData(match._id);
  socketService.emitScoreUpdate(match._id, liveData);

  return { innings, liveData };
};

/**
 * Undo Last Delivery
 * Marks last active delivery isUndone: true, then rebuilds innings from active deliveries
 */
const undoLastDelivery = async (matchId, userId = null) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const innings = await Innings.findOne({
    matchId: match._id,
    inningsNumber: match.currentInnings,
  });
  if (!innings) throw new Error('Active innings not found');

  const lastDelivery = await Delivery.findOne({
    matchId: match._id,
    inningsId: innings._id,
    isUndone: false,
  }).sort({ sequence: -1 });

  if (!lastDelivery) {
    throw new Error('No deliveries to undo in current innings');
  }

  lastDelivery.isUndone = true;
  await lastDelivery.save();

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'delivery_undone',
      entityType: 'Delivery',
      entityId: lastDelivery._id,
      matchId: match._id,
      oldValue: lastDelivery.toObject(),
    });
  }

  // Rebuild state from active deliveries
  await rebuildInningsFromDeliveries(match._id, innings.inningsNumber);

  const liveData = await scorecardService.getLiveMatchData(match._id);
  socketService.emitScoreUpdate(match._id, liveData);

  return { message: 'Delivery undone successfully', liveData };
};

/**
 * Edit a previous delivery
 * Updates delivery, then rebuilds innings from active deliveries
 */
const editDelivery = async (matchId, deliveryId, updateData, userId = null) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const delivery = await Delivery.findOne({ _id: deliveryId, matchId: match._id });
  if (!delivery) throw new Error('Delivery not found');

  const oldData = delivery.toObject();

  if (updateData.runsOffBat !== undefined) delivery.runsOffBat = updateData.runsOffBat;
  if (updateData.extraType !== undefined) delivery.extraType = updateData.extraType;
  if (updateData.extraRuns !== undefined) delivery.extraRuns = updateData.extraRuns;
  if (updateData.isWicket !== undefined) delivery.isWicket = updateData.isWicket;
  if (updateData.wicketType !== undefined) delivery.wicketType = updateData.wicketType;
  if (updateData.dismissedPlayerId !== undefined)
    delivery.dismissedPlayerId = updateData.dismissedPlayerId;
  if (updateData.fielderId !== undefined) delivery.fielderId = updateData.fielderId;

  delivery.totalRuns = (delivery.runsOffBat || 0) + (delivery.extraRuns || 0);

  if (delivery.extraType === 'wide' || delivery.extraType === 'no_ball' || delivery.extraType === 'penalty') {
    delivery.isLegalDelivery = false;
  } else {
    delivery.isLegalDelivery = true;
  }

  await delivery.save();

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'delivery_edited',
      entityType: 'Delivery',
      entityId: delivery._id,
      matchId: match._id,
      oldValue: oldData,
      newValue: delivery.toObject(),
    });
  }

  // Rebuild innings completely
  await rebuildInningsFromDeliveries(match._id, delivery.inningsNumber);

  const liveData = await scorecardService.getLiveMatchData(match._id);
  socketService.emitScoreUpdate(match._id, liveData);

  return { message: 'Delivery updated successfully', delivery, liveData };
};

/**
 * Critical Function: Reconstruct innings state completely from active deliveries
 */
const rebuildInningsFromDeliveries = async (matchId, inningsNumber) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const innings = await Innings.findOne({ matchId: match._id, inningsNumber });
  if (!innings) throw new Error('Innings not found');

  const deliveries = await Delivery.find({
    matchId: match._id,
    inningsId: innings._id,
    isUndone: false,
  }).sort({ sequence: 1 });

  let runs = 0;
  let wickets = 0;
  let legalBalls = 0;
  const extras = { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 };
  let isFreeHit = false;

  let currentStrikerId = innings.strikerId;
  let currentNonStrikerId = innings.nonStrikerId;
  let currentBowlerId = innings.currentBowlerId;
  let previousBowlerId = innings.previousBowlerId;

  for (const d of deliveries) {
    runs += d.totalRuns;

    if (d.extraType === 'wide') {
      extras.wides += d.extraRuns;
    } else if (d.extraType === 'no_ball') {
      extras.noBalls += d.extraRuns;
    } else if (d.extraType === 'bye') {
      extras.byes += d.extraRuns;
    } else if (d.extraType === 'leg_bye') {
      extras.legByes += d.extraRuns;
    } else if (d.extraType === 'penalty') {
      extras.penalty += d.extraRuns;
    }

    if (d.isLegalDelivery) {
      legalBalls += 1;
    }

    if (d.isWicket) {
      wickets += 1;
    }

    // Set free hit for next ball if no ball
    if (d.extraType === 'no_ball') {
      isFreeHit = true;
    } else if (d.isLegalDelivery) {
      isFreeHit = false;
    }

    // Tracking bowler
    currentBowlerId = d.bowlerId;
    if (d.isLegalDelivery && legalBalls % 6 === 0) {
      previousBowlerId = d.bowlerId;
    }
  }

  innings.runs = runs;
  innings.wickets = wickets;
  innings.legalBalls = legalBalls;
  innings.extras = extras;
  innings.isFreeHit = isFreeHit;
  innings.isOverComplete = legalBalls > 0 && legalBalls % 6 === 0;

  // Restore match status if it was completed by mistake
  if (match.status === 'completed' && match.currentInnings === inningsNumber) {
    const maxBalls = match.totalOvers * 6;
    if (inningsNumber === 2 && innings.target) {
      if (runs < innings.target && wickets < 10 && legalBalls < maxBalls) {
        match.status = 'live';
        match.winner = null;
        match.result = '';
        match.completedAt = null;
        innings.status = 'live';
      }
    }
  }

  await innings.save();
  await match.save();

  return { innings, match };
};

/**
 * Manually End Innings
 */
const endInnings = async (matchId, userId = null) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const innings = await Innings.findOne({
    matchId: match._id,
    inningsNumber: match.currentInnings,
  });
  if (!innings) throw new Error('Active innings not found');

  innings.status = 'completed';
  await innings.save();

  if (match.currentInnings === 1) {
    match.status = 'innings_break';
    await match.save();

    socketService.emitInningsEnd(match._id, {
      inningsNumber: 1,
      runs: innings.runs,
      wickets: innings.wickets,
      target: innings.runs + 1,
    });
  }

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'innings_ended',
      entityType: 'Innings',
      entityId: innings._id,
      matchId: match._id,
      newValue: { status: 'completed' },
    });
  }

  return innings;
};

module.exports = {
  recordDelivery,
  selectBatsman,
  selectBowler,
  undoLastDelivery,
  editDelivery,
  rebuildInningsFromDeliveries,
  endInnings,
};
