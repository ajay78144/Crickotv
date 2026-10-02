const Match = require('../models/Match');
const Innings = require('../models/Innings');
const Delivery = require('../models/Delivery');
const Player = require('../models/Player');
const {
  ballsToOvers,
  calculateRunRate,
  calculateRequiredRunRate,
} = require('../utils/cricketRules');

/**
 * Helper to calculate stats for a single batsman across given deliveries
 */
const calculateBatterStats = (deliveries, playerId) => {
  let runs = 0;
  let balls = 0;
  let fours = 0;
  let sixes = 0;
  let isOut = false;
  let dismissal = 'not out';

  for (const d of deliveries) {
    if (d.strikerId?.toString() === playerId?.toString()) {
      // Wide ball does NOT count as a ball faced for the batter
      if (d.extraType !== 'wide') {
        balls += 1;
      }
      runs += d.runsOffBat;
      if (d.runsOffBat === 4) fours += 1;
      if (d.runsOffBat === 6) sixes += 1;
    }

    if (d.isWicket && d.dismissedPlayerId?.toString() === playerId?.toString()) {
      isOut = true;
      dismissal = d.wicketType ? d.wicketType.replace('_', ' ') : 'out';
    }
  }

  const strikeRate = balls > 0 ? Number(((runs / balls) * 100).toFixed(2)) : 0;

  return {
    runs,
    balls,
    fours,
    sixes,
    strikeRate,
    isOut,
    dismissal,
  };
};

/**
 * Helper to calculate stats for a single bowler across given deliveries
 */
const calculateBowlerStats = (deliveries, playerId) => {
  let legalBalls = 0;
  let runs = 0;
  let wickets = 0;
  let wides = 0;
  let noBalls = 0;

  // Group deliveries by over to count maidens
  const oversMap = {};

  for (const d of deliveries) {
    if (d.bowlerId?.toString() === playerId?.toString()) {
      if (d.isLegalDelivery) {
        legalBalls += 1;
      }

      // Bowler conceded runs include runsOffBat + wides + noBalls (byes and leg byes not against bowler)
      if (d.extraType === 'wide') {
        wides += d.extraRuns;
        runs += d.extraRuns;
      } else if (d.extraType === 'no_ball') {
        noBalls += d.extraRuns;
        runs += d.runsOffBat + d.extraRuns;
      } else if (d.extraType === 'bye' || d.extraType === 'leg_bye' || d.extraType === 'penalty') {
        // Not charged to bowler
      } else {
        runs += d.runsOffBat;
      }

      // Wickets credited to bowler (run out and retired out are not credited to bowler)
      if (d.isWicket && d.wicketType !== 'run_out' && d.wicketType !== 'retired_out') {
        wickets += 1;
      }

      const overKey = `${d.overNumber}`;
      if (!oversMap[overKey]) oversMap[overKey] = { runs: 0, legalBalls: 0 };
      if (d.extraType !== 'bye' && d.extraType !== 'leg_bye') {
        oversMap[overKey].runs += d.runsOffBat + (d.extraRuns || 0);
      }
      if (d.isLegalDelivery) {
        oversMap[overKey].legalBalls += 1;
      }
    }
  }

  // Maidens: 6 legal balls bowled in that over with 0 runs conceded
  let maidens = 0;
  for (const overKey in oversMap) {
    if (oversMap[overKey].legalBalls === 6 && oversMap[overKey].runs === 0) {
      maidens += 1;
    }
  }

  const overs = ballsToOvers(legalBalls);
  const oversDecimal = legalBalls / 6;
  const economy = oversDecimal > 0 ? Number((runs / oversDecimal).toFixed(2)) : 0;

  return {
    overs,
    legalBalls,
    maidens,
    runs,
    wickets,
    wides,
    noBalls,
    economy,
  };
};

/**
 * Get normalized live match data (used by Angular frontend, Admin scoring, and OBS overlays)
 */
const getLiveMatchData = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName logo primaryColor secondaryColor')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor')
    .populate('winner', 'name shortName logo');

  if (!match) throw new Error('Match not found');

  const currentInningsNum = match.currentInnings || 1;
  const innings = await Innings.findOne({ matchId: match._id, inningsNumber: currentInningsNum })
    .populate('battingTeamId', 'name shortName logo')
    .populate('bowlingTeamId', 'name shortName logo')
    .populate('strikerId', 'name jerseyNumber photo role')
    .populate('nonStrikerId', 'name jerseyNumber photo role')
    .populate('currentBowlerId', 'name jerseyNumber photo role');

  if (!innings) {
    return {
      matchId: match._id,
      status: match.status,
      matchNumber: match.matchNumber,
      venue: match.venue,
      teamA: match.teamA,
      teamB: match.teamB,
      toss: match.toss,
      score: null,
    };
  }

  // Fetch active deliveries for this innings
  const deliveries = await Delivery.find({
    matchId: match._id,
    inningsId: innings._id,
    isUndone: false,
  }).sort({ sequence: 1 });

  // Striker stats
  let strikerData = null;
  if (innings.strikerId) {
    const stats = calculateBatterStats(deliveries, innings.strikerId._id);
    strikerData = {
      id: innings.strikerId._id,
      name: innings.strikerId.name,
      photo: innings.strikerId.photo,
      jerseyNumber: innings.strikerId.jerseyNumber,
      ...stats,
    };
  }

  // Non-striker stats
  let nonStrikerData = null;
  if (innings.nonStrikerId) {
    const stats = calculateBatterStats(deliveries, innings.nonStrikerId._id);
    nonStrikerData = {
      id: innings.nonStrikerId._id,
      name: innings.nonStrikerId.name,
      photo: innings.nonStrikerId.photo,
      jerseyNumber: innings.nonStrikerId.jerseyNumber,
      ...stats,
    };
  }

  // Current Bowler stats
  let bowlerData = null;
  if (innings.currentBowlerId) {
    const stats = calculateBowlerStats(deliveries, innings.currentBowlerId._id);
    bowlerData = {
      id: innings.currentBowlerId._id,
      name: innings.currentBowlerId.name,
      photo: innings.currentBowlerId.photo,
      jerseyNumber: innings.currentBowlerId.jerseyNumber,
      ...stats,
    };
  }

  // Recent balls (last 6 to 12 deliveries)
  const recentDeliveries = deliveries.slice(-12);
  const recentBalls = recentDeliveries.map((d) => {
    if (d.isWicket) return 'W';
    if (d.extraType === 'wide') return `${d.extraRuns}Wd`;
    if (d.extraType === 'no_ball') return `${d.runsOffBat + d.extraRuns}Nb`;
    if (d.extraType === 'bye') return `${d.extraRuns}B`;
    if (d.extraType === 'leg_bye') return `${d.extraRuns}Lb`;
    return String(d.runsOffBat);
  });

  // Run rates
  const currentRunRate = calculateRunRate(innings.runs, innings.legalBalls);

  let required = null;
  if (currentInningsNum === 2 && innings.target) {
    const runsNeeded = Math.max(0, innings.target - innings.runs);
    const totalMaxBalls = match.totalOvers * 6;
    const ballsRemaining = Math.max(0, totalMaxBalls - innings.legalBalls);
    const requiredRunRate = calculateRequiredRunRate(runsNeeded, ballsRemaining);
    required = {
      runs: runsNeeded,
      balls: ballsRemaining,
      requiredRunRate,
    };
  }

  return {
    matchId: match._id,
    status: match.status,
    innings: currentInningsNum,
    matchType: match.matchType,
    totalOvers: match.totalOvers,
    venue: match.venue,
    battingTeam: {
      id: innings.battingTeamId._id,
      name: innings.battingTeamId.name,
      shortName: innings.battingTeamId.shortName,
      logo: innings.battingTeamId.logo,
    },
    bowlingTeam: {
      id: innings.bowlingTeamId._id,
      name: innings.bowlingTeamId.name,
      shortName: innings.bowlingTeamId.shortName,
      logo: innings.bowlingTeamId.logo,
    },
    score: {
      runs: innings.runs,
      wickets: innings.wickets,
      overs: ballsToOvers(innings.legalBalls),
      legalBalls: innings.legalBalls,
      extras: innings.extras,
    },
    striker: strikerData,
    nonStriker: nonStrikerData,
    bowler: bowlerData,
    target: innings.target,
    required,
    currentRunRate,
    recentBalls,
    isFreeHit: innings.isFreeHit,
    isOverComplete: innings.isOverComplete,
    result: match.result,
    winner: match.winner,
    nextExpectedSequence: deliveries.length + 1,
  };
};

/**
 * Get comprehensive full scorecard for both innings
 */
const getFullScorecard = async (matchId) => {
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName logo primaryColor secondaryColor')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor')
    .populate('winner', 'name shortName logo')
    .populate('tournamentId', 'name shortName format');

  if (!match) throw new Error('Match not found');

  const inningsList = await Innings.find({ matchId: match._id })
    .populate('battingTeamId', 'name shortName logo')
    .populate('bowlingTeamId', 'name shortName logo')
    .sort({ inningsNumber: 1 });

  const scorecardInnings = [];

  for (const inn of inningsList) {
    const deliveries = await Delivery.find({
      matchId: match._id,
      inningsId: inn._id,
      isUndone: false,
    })
      .populate('strikerId', 'name')
      .populate('bowlerId', 'name')
      .populate('dismissedPlayerId', 'name')
      .populate('fielderId', 'name')
      .sort({ sequence: 1 });

    // Identify all batters who batted
    const batterIdSet = new Set();
    deliveries.forEach((d) => {
      if (d.strikerId?._id) batterIdSet.add(d.strikerId._id.toString());
      if (d.nonStrikerId) batterIdSet.add(d.nonStrikerId.toString());
    });
    if (inn.strikerId) batterIdSet.add(inn.strikerId.toString());
    if (inn.nonStrikerId) batterIdSet.add(inn.nonStrikerId.toString());

    const batting = [];
    for (const bId of batterIdSet) {
      const p = await Player.findById(bId);
      if (p) {
        const stats = calculateBatterStats(deliveries, bId);
        batting.push({
          player: {
            id: p._id,
            name: p.name,
            jerseyNumber: p.jerseyNumber,
          },
          ...stats,
        });
      }
    }

    // Identify all bowlers who bowled
    const bowlerIdSet = new Set();
    deliveries.forEach((d) => {
      if (d.bowlerId?._id) bowlerIdSet.add(d.bowlerId._id.toString());
    });

    const bowling = [];
    for (const bId of bowlerIdSet) {
      const p = await Player.findById(bId);
      if (p) {
        const stats = calculateBowlerStats(deliveries, bId);
        bowling.push({
          player: {
            id: p._id,
            name: p.name,
            jerseyNumber: p.jerseyNumber,
          },
          ...stats,
        });
      }
    }

    // Fall of wickets
    const fallOfWickets = [];
    let currentScore = 0;
    let wicketsLost = 0;
    let legalCount = 0;

    for (const d of deliveries) {
      currentScore += d.totalRuns;
      if (d.isLegalDelivery) legalCount += 1;
      if (d.isWicket) {
        wicketsLost += 1;
        fallOfWickets.push({
          wicketNumber: wicketsLost,
          score: currentScore,
          player: d.dismissedPlayerId?.name || 'Batsman',
          overs: ballsToOvers(legalCount),
        });
      }
    }

    scorecardInnings.push({
      inningsNumber: inn.inningsNumber,
      battingTeam: inn.battingTeamId,
      bowlingTeam: inn.bowlingTeamId,
      runs: inn.runs,
      wickets: inn.wickets,
      overs: ballsToOvers(inn.legalBalls),
      extras: inn.extras,
      target: inn.target,
      status: inn.status,
      batting,
      bowling,
      fallOfWickets,
    });
  }

  return {
    match: {
      id: match._id,
      matchNumber: match.matchNumber,
      matchType: match.matchType,
      totalOvers: match.totalOvers,
      venue: match.venue,
      date: match.date,
      status: match.status,
      toss: match.toss,
      winner: match.winner,
      result: match.result,
      teamA: match.teamA,
      teamB: match.teamB,
      tournament: match.tournamentId,
    },
    innings: scorecardInnings,
  };
};

module.exports = {
  getLiveMatchData,
  getFullScorecard,
  calculateBatterStats,
  calculateBowlerStats,
};
