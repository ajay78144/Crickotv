const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sponsor name is required'],
      trim: true,
    },
    logo: {
      type: String,
      required: [true, 'Logo URL is required'],
    },
    website: {
      type: String,
      default: '',
    },
    displayDuration: {
      type: Number,
      default: 10, // seconds
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sponsor = mongoose.model('Sponsor', sponsorSchema);

module.exports = Sponsor;
