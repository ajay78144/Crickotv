const Team = require('../models/Team');

const getAllTeams = async (filter = {}) => {
  const query = {};
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { shortName: { $regex: filter.search, $options: 'i' } },
    ];
  }
  if (filter.isActive !== undefined) {
    query.isActive = filter.isActive === 'true' || filter.isActive === true;
  }
  return await Team.find(query).sort({ name: 1 });
};

const getTeamById = async (id) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new Error('Team not found');
  }
  return team;
};

const createTeam = async (data) => {
  const existing = await Team.findOne({
    $or: [{ name: data.name }, { shortName: data.shortName }],
  });
  if (existing) {
    throw new Error('A team with this name or shortName already exists');
  }
  return await Team.create(data);
};

const updateTeam = async (id, data) => {
  const team = await Team.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!team) {
    throw new Error('Team not found');
  }
  return team;
};

const deleteTeam = async (id) => {
  const team = await Team.findByIdAndDelete(id);
  if (!team) {
    throw new Error('Team not found');
  }
  return team;
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
