const scoringService = require('../services/scoring.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const recordDelivery = async (req, res, next) => {
  try {
    const result = await scoringService.recordDelivery(
      req.params.id,
      req.body,
      req.user?._id
    );
    return successResponse(res, 201, 'Delivery recorded successfully', result);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return errorResponse(res, statusCode, error.message);
  }
};

const selectBatsman = async (req, res, next) => {
  try {
    const result = await scoringService.selectBatsman(
      req.params.id,
      req.body.playerId,
      req.user?._id
    );
    return successResponse(res, 200, 'Batsman selected successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const selectBowler = async (req, res, next) => {
  try {
    const result = await scoringService.selectBowler(
      req.params.id,
      req.body.playerId,
      req.user?._id
    );
    return successResponse(res, 200, 'Bowler selected successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const undoDelivery = async (req, res, next) => {
  try {
    const result = await scoringService.undoLastDelivery(req.params.id, req.user?._id);
    return successResponse(res, 200, 'Delivery undone successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const editDelivery = async (req, res, next) => {
  try {
    const result = await scoringService.editDelivery(
      req.params.id,
      req.params.deliveryId,
      req.body,
      req.user?._id
    );
    return successResponse(res, 200, 'Delivery updated successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const endInnings = async (req, res, next) => {
  try {
    const result = await scoringService.endInnings(req.params.id, req.user?._id);
    return successResponse(res, 200, 'Innings ended successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

module.exports = {
  recordDelivery,
  selectBatsman,
  selectBowler,
  undoDelivery,
  editDelivery,
  endInnings,
};
