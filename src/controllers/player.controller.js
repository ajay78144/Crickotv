const playerService = require('../services/player.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllPlayers = async (req, res, next) => {
  try {
    const players = await playerService.getAllPlayers(req.query);
    return successResponse(res, 200, 'Players retrieved successfully', players);
  } catch (error) {
    next(error);
  }
};

const getPlayerById = async (req, res, next) => {
  try {
    const player = await playerService.getPlayerById(req.params.id);
    return successResponse(res, 200, 'Player retrieved successfully', player);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const getPlayersByTeam = async (req, res, next) => {
  try {
    const players = await playerService.getPlayersByTeam(req.params.teamId);
    return successResponse(res, 200, 'Team players retrieved successfully', players);
  } catch (error) {
    next(error);
  }
};

const createPlayer = async (req, res, next) => {
  try {
    const player = await playerService.createPlayer(req.body);
    return successResponse(res, 201, 'Player created successfully', player);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const updatePlayer = async (req, res, next) => {
  try {
    const player = await playerService.updatePlayer(req.params.id, req.body);
    return successResponse(res, 200, 'Player updated successfully', player);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const deletePlayer = async (req, res, next) => {
  try {
    const player = await playerService.deletePlayer(req.params.id);
    return successResponse(res, 200, 'Player deleted successfully', player);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  getPlayersByTeam,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
