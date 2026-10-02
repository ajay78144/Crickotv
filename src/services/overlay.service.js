const OverlaySetting = require('../models/OverlaySetting');
const socketService = require('./socket.service');

const getOverlaySetting = async (matchId) => {
  let setting = await OverlaySetting.findOne({ matchId });
  if (!setting) {
    setting = await OverlaySetting.create({ matchId });
  }
  return setting;
};

const updateOverlaySetting = async (matchId, data) => {
  let setting = await OverlaySetting.findOneAndUpdate({ matchId }, data, {
    new: true,
    upsert: true,
    runValidators: true,
  });

  socketService.emitOverlayUpdate(matchId, setting);

  return setting;
};

module.exports = {
  getOverlaySetting,
  updateOverlaySetting,
};
