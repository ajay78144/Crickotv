const tournamentService = require('../services/tournament.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllTournaments = async (req, res, next) => {
  try {
    const tournaments = await tournamentService.getAllTournaments(req.query);
    return successResponse(res, 200, 'Tournaments retrieved successfully', tournaments);
  } catch (error) {
    next(error);
  }
};

const getTournamentById = async (req, res, next) => {
  try {
    const tournament = await tournamentService.getTournamentById(req.params.id);
    return successResponse(res, 200, 'Tournament retrieved successfully', tournament);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const createTournament = async (req, res, next) => {
  try {
    const tournament = await tournamentService.createTournament(req.body);
    return successResponse(res, 201, 'Tournament created successfully', tournament);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const updateTournament = async (req, res, next) => {
  try {
    const tournament = await tournamentService.updateTournament(req.params.id, req.body);
    return successResponse(res, 200, 'Tournament updated successfully', tournament);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const deleteTournament = async (req, res, next) => {
  try {
    const tournament = await tournamentService.deleteTournament(req.params.id);
    return successResponse(res, 200, 'Tournament deleted successfully', tournament);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
};
