const sponsorService = require('../services/sponsor.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getSponsors = async (req, res, next) => {
  try {
    const sponsors = await sponsorService.getSponsors();
    return successResponse(res, 200, 'Sponsors retrieved successfully', sponsors);
  } catch (error) {
    next(error);
  }
};

const createSponsor = async (req, res, next) => {
  try {
    const sponsor = await sponsorService.createSponsor(req.body);
    return successResponse(res, 201, 'Sponsor created successfully', sponsor);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const updateSponsor = async (req, res, next) => {
  try {
    const sponsor = await sponsorService.updateSponsor(req.params.id, req.body);
    return successResponse(res, 200, 'Sponsor updated successfully', sponsor);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const deleteSponsor = async (req, res, next) => {
  try {
    const sponsor = await sponsorService.deleteSponsor(req.params.id);
    return successResponse(res, 200, 'Sponsor deleted successfully', sponsor);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

module.exports = {
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
};
