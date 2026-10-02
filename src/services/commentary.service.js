const Delivery = require('../models/Delivery');

const getCommentary = async (matchId, page = 1, limit = 30) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
  const skip = (pageNum - 1) * limitNum;

  const query = {
    matchId,
    isUndone: false,
  };

  const [deliveries, total] = await Promise.all([
    Delivery.find(query)
      .populate('strikerId', 'name')
      .populate('bowlerId', 'name')
      .populate('dismissedPlayerId', 'name')
      .populate('fielderId', 'name')
      .sort({ sequence: -1 })
      .skip(skip)
      .limit(limitNum),
    Delivery.countDocuments(query),
  ]);

  const items = deliveries.map((d) => ({
    id: d._id,
    inningsNumber: d.inningsNumber,
    sequence: d.sequence,
    overNumber: d.overNumber,
    ballNumber: d.ballNumber,
    overDisplay: `${d.overNumber}.${d.ballNumber}`,
    striker: d.strikerId?.name,
    bowler: d.bowlerId?.name,
    runsOffBat: d.runsOffBat,
    extraType: d.extraType,
    extraRuns: d.extraRuns,
    totalRuns: d.totalRuns,
    isWicket: d.isWicket,
    wicketType: d.wicketType,
    dismissedPlayer: d.dismissedPlayerId?.name,
    fielder: d.fielderId?.name,
    isFreeHit: d.isFreeHit,
    commentary: d.commentary,
    createdAt: d.createdAt,
  }));

  return {
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

module.exports = {
  getCommentary,
};
