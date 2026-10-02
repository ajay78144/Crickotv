const matchService = require('../services/match.service');
const scorecardService = require('../services/scorecard.service');
const commentaryService = require('../services/commentary.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getMatches(req.query);
    return successResponse(res, 200, 'Matches retrieved successfully', matches);
  } catch (error) {
    next(error);
  }
};

const getLiveMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getLiveMatches();
    return successResponse(res, 200, 'Live matches retrieved successfully', matches);
  } catch (error) {
    next(error);
  }
};

const getUpcomingMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getUpcomingMatches();
    return successResponse(res, 200, 'Upcoming matches retrieved successfully', matches);
  } catch (error) {
    next(error);
  }
};

const getCompletedMatches = async (req, res, next) => {
  try {
    const matches = await matchService.getCompletedMatches();
    return successResponse(res, 200, 'Completed matches retrieved successfully', matches);
  } catch (error) {
    next(error);
  }
};

const getMatchById = async (req, res, next) => {
  try {
    const match = await matchService.getMatchById(req.params.id);
    return successResponse(res, 200, 'Match retrieved successfully', match);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const createMatch = async (req, res, next) => {
  try {
    const match = await matchService.createMatch(req.body, req.user?._id);
    return successResponse(res, 201, 'Match created successfully', match);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const updateMatch = async (req, res, next) => {
  try {
    const match = await matchService.updateMatch(req.params.id, req.body, req.user?._id);
    return successResponse(res, 200, 'Match updated successfully', match);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const deleteMatch = async (req, res, next) => {
  try {
    const match = await matchService.deleteMatch(req.params.id);
    return successResponse(res, 200, 'Match deleted successfully', match);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const setPlayingXI = async (req, res, next) => {
  try {
    const match = await matchService.setPlayingXI(req.params.id, req.body, req.user?._id);
    return successResponse(res, 200, 'Playing XI saved successfully', match);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const recordToss = async (req, res, next) => {
  try {
    const match = await matchService.recordToss(req.params.id, req.body, req.user?._id);
    return successResponse(res, 200, 'Toss recorded successfully', match);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const startMatch = async (req, res, next) => {
  try {
    const result = await matchService.startMatch(req.params.id, req.body, req.user?._id);
    return successResponse(res, 200, 'Match started successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const startSecondInnings = async (req, res, next) => {
  try {
    const result = await matchService.startSecondInnings(req.params.id, req.body, req.user?._id);
    return successResponse(res, 200, 'Second innings started successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getLiveScore = async (req, res, next) => {
  try {
    const liveData = await scorecardService.getLiveMatchData(req.params.id);
    return successResponse(res, 200, 'Live score retrieved successfully', liveData);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const getScorecard = async (req, res, next) => {
  try {
    const scorecard = await scorecardService.getFullScorecard(req.params.id);
    return successResponse(res, 200, 'Scorecard retrieved successfully', scorecard);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const getCommentary = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const commentary = await commentaryService.getCommentary(req.params.id, page, limit);
    return successResponse(res, 200, 'Commentary retrieved successfully', commentary);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
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
  getLiveScore,
  getScorecard,
  getCommentary,
};
