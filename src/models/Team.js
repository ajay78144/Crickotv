const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      unique: true,
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      trim: true,
      uppercase: true,
      maxlength: 5,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#1E3A8A', // Deep Blue
    },
    secondaryColor: {
      type: String,
      default: '#F59E0B', // Amber Gold
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

teamSchema.index({ name: 1 });
teamSchema.index({ shortName: 1 });

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
