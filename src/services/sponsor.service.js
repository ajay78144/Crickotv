const Sponsor = require('../models/Sponsor');

const getSponsors = async () => {
  return await Sponsor.find({ isActive: true }).sort({ createdAt: -1 });
};

const createSponsor = async (data) => {
  return await Sponsor.create(data);
};

const updateSponsor = async (id, data) => {
  const sponsor = await Sponsor.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!sponsor) throw new Error('Sponsor not found');
  return sponsor;
};

const deleteSponsor = async (id) => {
  const sponsor = await Sponsor.findByIdAndDelete(id);
  if (!sponsor) throw new Error('Sponsor not found');
  return sponsor;
};

module.exports = {
  getSponsors,
  createSponsor,
  updateSponsor,
  deleteSponsor,
};
