const Tournament = require('../models/Tournament');

const getAllTournaments = async (filters = {}) => {
  const query = {};
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.format) {
    query.format = filters.format;
  }
  return await Tournament.find(query).sort({ startDate: -1 });
};

const getTournamentById = async (id) => {
  const tournament = await Tournament.findById(id);
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  return tournament;
};

const createTournament = async (data) => {
  return await Tournament.create(data);
};

const updateTournament = async (id, data) => {
  const tournament = await Tournament.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  return tournament;
};

const deleteTournament = async (id) => {
  const tournament = await Tournament.findByIdAndDelete(id);
  if (!tournament) {
    throw new Error('Tournament not found');
  }
  return tournament;
};

module.exports = {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
};
