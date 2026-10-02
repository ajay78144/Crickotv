const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tournament name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      trim: true,
      uppercase: true,
    },
    logo: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    season: {
      type: String,
      default: () => new Date().getFullYear().toString(),
    },
    format: {
      type: String,
      enum: ['T20', 'ODI', 'TEST', 'T10'],
      default: 'T20',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'ongoing',
    },
  },
  {
    timestamps: true,
  }
);

tournamentSchema.index({ status: 1 });

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
