const overlayService = require('../services/overlay.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getOverlaySetting = async (req, res, next) => {
  try {
    const setting = await overlayService.getOverlaySetting(req.params.matchId);
    return successResponse(res, 200, 'Overlay settings retrieved', setting);
  } catch (error) {
    next(error);
  }
};

const updateOverlaySetting = async (req, res, next) => {
  try {
    const setting = await overlayService.updateOverlaySetting(req.params.matchId, req.body);
    return successResponse(res, 200, 'Overlay settings updated', setting);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  getOverlaySetting,
  updateOverlaySetting,
};
