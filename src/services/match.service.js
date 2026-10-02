const Match = require('../models/Match');
const Innings = require('../models/Innings');
const Player = require('../models/Player');
const OverlaySetting = require('../models/OverlaySetting');
const AuditLog = require('../models/AuditLog');
const socketService = require('./socket.service');

const getMatches = async (filters = {}) => {
  const query = {};
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.tournamentId) {
    query.tournamentId = filters.tournamentId;
  }
  if (filters.teamId) {
    query.$or = [{ teamA: filters.teamId }, { teamB: filters.teamId }];
  }
  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }

  return await Match.find(query)
    .populate('teamA', 'name shortName logo primaryColor secondaryColor')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor')
    .populate('tournamentId', 'name shortName format')
    .populate('winner', 'name shortName logo')
    .sort({ date: -1 });
};

const getLiveMatches = async () => {
  return await Match.find({ status: { $in: ['live', 'innings_break', 'toss', 'paused'] } })
    .populate('teamA', 'name shortName logo primaryColor secondaryColor')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor')
    .populate('tournamentId', 'name shortName format')
    .sort({ updatedAt: -1 });
};

const getUpcomingMatches = async () => {
  return await Match.find({ status: 'scheduled' })
    .populate('teamA', 'name shortName logo primaryColor secondaryColor')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor')
    .populate('tournamentId', 'name shortName format')
    .sort({ date: 1 });
};

const getCompletedMatches = async () => {
  return await Match.find({ status: 'completed' })
    .populate('teamA', 'name shortName logo primaryColor secondaryColor')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor')
    .populate('tournamentId', 'name shortName format')
    .populate('winner', 'name shortName logo')
    .sort({ completedAt: -1, date: -1 });
};

const getMatchById = async (id) => {
  const match = await Match.findById(id)
    .populate('teamA', 'name shortName logo primaryColor secondaryColor')
    .populate('teamB', 'name shortName logo primaryColor secondaryColor')
    .populate('tournamentId', 'name shortName format')
    .populate('playingXI.teamA', 'name role jerseyNumber photo battingStyle bowlingStyle')
    .populate('playingXI.teamB', 'name role jerseyNumber photo battingStyle bowlingStyle')
    .populate('toss.winnerTeamId', 'name shortName logo')
    .populate('winner', 'name shortName logo');

  if (!match) {
    throw new Error('Match not found');
  }
  return match;
};

const createMatch = async (data, userId = null) => {
  const match = await Match.create({
    ...data,
    createdBy: userId,
  });

  // Create default overlay settings
  await OverlaySetting.create({
    matchId: match._id,
  });

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'match_create',
      entityType: 'Match',
      entityId: match._id,
      matchId: match._id,
      newValue: match.toObject(),
    });
  }

  return match;
};

const updateMatch = async (id, data, userId = null) => {
  const match = await Match.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!match) {
    throw new Error('Match not found');
  }
  return match;
};

const deleteMatch = async (id) => {
  const match = await Match.findByIdAndDelete(id);
  if (!match) {
    throw new Error('Match not found');
  }
  await Innings.deleteMany({ matchId: id });
  await OverlaySetting.deleteMany({ matchId: id });
  return match;
};

/**
 * Set Playing XI for both teams
 */
const setPlayingXI = async (matchId, { teamA, teamB }, userId = null) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  if (match.status !== 'scheduled' && match.status !== 'toss') {
    throw new Error('Playing XI can only be modified before match starts');
  }

  // Verify all teamA players belong to teamA
  const playersA = await Player.find({ _id: { $in: teamA }, teamId: match.teamA });
  if (playersA.length !== 11) {
    throw new Error('All 11 players for Team A must belong to Team A');
  }

  // Verify all teamB players belong to teamB
  const playersB = await Player.find({ _id: { $in: teamB }, teamId: match.teamB });
  if (playersB.length !== 11) {
    throw new Error('All 11 players for Team B must belong to Team B');
  }

  match.playingXI = { teamA, teamB };
  await match.save();

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'playing_xi_updated',
      entityType: 'Match',
      entityId: match._id,
      matchId: match._id,
      newValue: { teamA, teamB },
    });
  }

  return match;
};

/**
 * Record Toss
 */
const recordToss = async (matchId, { winnerTeamId, decision }, userId = null) => {
  const match = await Match.findById(matchId)
    .populate('teamA', 'name shortName')
    .populate('teamB', 'name shortName');

  if (!match) throw new Error('Match not found');

  const winnerIdStr = winnerTeamId.toString();
  const teamAIdStr = match.teamA._id.toString();
  const teamBIdStr = match.teamB._id.toString();

  if (winnerIdStr !== teamAIdStr && winnerIdStr !== teamBIdStr) {
    throw new Error('Winner team must be one of the playing teams');
  }

  const winnerTeam = winnerIdStr === teamAIdStr ? match.teamA : match.teamB;
  const loserTeam = winnerIdStr === teamAIdStr ? match.teamB : match.teamA;

  let battingFirstTeamId;
  let bowlingFirstTeamId;

  if (decision === 'bat') {
    battingFirstTeamId = winnerTeam._id;
    bowlingFirstTeamId = loserTeam._id;
  } else {
    battingFirstTeamId = loserTeam._id;
    bowlingFirstTeamId = winnerTeam._id;
  }

  const tossSummary = `${winnerTeam.name} won the toss and elected to ${decision} first.`;

  match.toss = {
    winnerTeamId: winnerTeam._id,
    decision,
    summary: tossSummary,
    battingFirstTeamId,
    bowlingFirstTeamId,
  };
  match.status = 'toss';
  await match.save();

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'toss_recorded',
      entityType: 'Match',
      entityId: match._id,
      matchId: match._id,
      newValue: match.toss,
    });
  }

  return match;
};

/**
 * Start Match (Innings 1)
 */
const startMatch = async (matchId, { strikerId, nonStrikerId, bowlerId }, userId = null) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  if (!match.toss || !match.toss.battingFirstTeamId) {
    throw new Error('Toss must be completed before starting the match');
  }

  if (
    !match.playingXI ||
    !match.playingXI.teamA?.length ||
    !match.playingXI.teamB?.length
  ) {
    throw new Error('Playing XI for both teams must be set before starting the match');
  }

  const battingTeamId = match.toss.battingFirstTeamId;
  const bowlingTeamId = match.toss.bowlingFirstTeamId;

  // Validate striker and nonStriker belong to batting team
  const battingPlayers = await Player.find({
    _id: { $in: [strikerId, nonStrikerId] },
    teamId: battingTeamId,
  });
  if (battingPlayers.length !== 2) {
    throw new Error('Striker and non-striker must both belong to the batting team');
  }

  // Validate bowler belongs to bowling team
  const bowler = await Player.findOne({
    _id: bowlerId,
    teamId: bowlingTeamId,
  });
  if (!bowler) {
    throw new Error('Bowler must belong to the bowling team');
  }

  // Check if Innings 1 already exists
  let innings = await Innings.findOne({ matchId: match._id, inningsNumber: 1 });
  if (!innings) {
    innings = await Innings.create({
      matchId: match._id,
      inningsNumber: 1,
      battingTeamId,
      bowlingTeamId,
      status: 'live',
      strikerId,
      nonStrikerId,
      currentBowlerId: bowlerId,
    });
  } else {
    innings.status = 'live';
    innings.strikerId = strikerId;
    innings.nonStrikerId = nonStrikerId;
    innings.currentBowlerId = bowlerId;
    await innings.save();
  }

  match.status = 'live';
  match.currentInnings = 1;
  await match.save();

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'match_start',
      entityType: 'Match',
      entityId: match._id,
      matchId: match._id,
      newValue: { strikerId, nonStrikerId, bowlerId, inningsId: innings._id },
    });
  }

  socketService.emitMatchStart(match._id, {
    matchId: match._id,
    status: 'live',
    currentInnings: 1,
    innings,
  });

  return { match, innings };
};

/**
 * Start Second Innings
 */
const startSecondInnings = async (
  matchId,
  { strikerId, nonStrikerId, bowlerId },
  userId = null
) => {
  const match = await Match.findById(matchId);
  if (!match) throw new Error('Match not found');

  const innings1 = await Innings.findOne({ matchId: match._id, inningsNumber: 1 });
  if (!innings1) {
    throw new Error('First innings must be completed before starting second innings');
  }

  const battingTeamId = innings1.bowlingTeamId;
  const bowlingTeamId = innings1.battingTeamId;
  const target = innings1.runs + 1;

  // Validate striker and nonStriker belong to second batting team
  const battingPlayers = await Player.find({
    _id: { $in: [strikerId, nonStrikerId] },
    teamId: battingTeamId,
  });
  if (battingPlayers.length !== 2) {
    throw new Error('Striker and non-striker must belong to the chasing team');
  }

  // Validate bowler belongs to bowling team
  const bowler = await Player.findOne({
    _id: bowlerId,
    teamId: bowlingTeamId,
  });
  if (!bowler) {
    throw new Error('Bowler must belong to defending team');
  }

  let innings2 = await Innings.findOne({ matchId: match._id, inningsNumber: 2 });
  if (!innings2) {
    innings2 = await Innings.create({
      matchId: match._id,
      inningsNumber: 2,
      battingTeamId,
      bowlingTeamId,
      target,
      status: 'live',
      strikerId,
      nonStrikerId,
      currentBowlerId: bowlerId,
    });
  } else {
    innings2.status = 'live';
    innings2.target = target;
    innings2.strikerId = strikerId;
    innings2.nonStrikerId = nonStrikerId;
    innings2.currentBowlerId = bowlerId;
    await innings2.save();
  }

  match.status = 'live';
  match.currentInnings = 2;
  await match.save();

  if (userId) {
    await AuditLog.create({
      userId,
      action: 'second_innings_start',
      entityType: 'Match',
      entityId: match._id,
      matchId: match._id,
      newValue: { strikerId, nonStrikerId, bowlerId, target, inningsId: innings2._id },
    });
  }

  socketService.emitMatchStart(match._id, {
    matchId: match._id,
    status: 'live',
    currentInnings: 2,
    target,
    innings: innings2,
  });

  return { match, innings: innings2 };
};

module.exports = {
  getMatches,
  getLiveMatches,
  getUpcomingMatches,
  getCompletedMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  setPlayingXI,
  recordToss,
  startMatch,
  startSecondInnings,
};
