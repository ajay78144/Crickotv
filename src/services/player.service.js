const Player = require('../models/Player');

const getAllPlayers = async (filters = {}) => {
  const query = {};
  if (filters.teamId) {
    query.teamId = filters.teamId;
  }
  if (filters.role) {
    query.role = filters.role;
  }
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === 'true' || filters.isActive === true;
  }

  return await Player.find(query).populate('teamId', 'name shortName logo').sort({ name: 1 });
};

const getPlayerById = async (id) => {
  const player = await Player.findById(id).populate('teamId', 'name shortName logo');
  if (!player) {
    throw new Error('Player not found');
  }
  return player;
};

const getPlayersByTeam = async (teamId) => {
  return await Player.find({ teamId, isActive: true }).sort({ name: 1 });
};

const createPlayer = async (data) => {
  return await Player.create(data);
};

const updatePlayer = async (id, data) => {
  const player = await Player.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate('teamId', 'name shortName logo');

  if (!player) {
    throw new Error('Player not found');
  }
  return player;
};

const deletePlayer = async (id) => {
  const player = await Player.findByIdAndDelete(id);
  if (!player) {
    throw new Error('Player not found');
  }
  return player;
};

module.exports = {
  getAllPlayers,
  getPlayerById,
  getPlayersByTeam,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
