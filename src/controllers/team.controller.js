const teamService = require('../services/team.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getAllTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getAllTeams(req.query);
    return successResponse(res, 200, 'Teams retrieved successfully', teams);
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    return successResponse(res, 200, 'Team retrieved successfully', team);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body);
    return successResponse(res, 201, 'Team created successfully', team);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await teamService.updateTeam(req.params.id, req.body);
    return successResponse(res, 200, 'Team updated successfully', team);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const team = await teamService.deleteTeam(req.params.id);
    return successResponse(res, 200, 'Team deleted successfully', team);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
