const mongoose = require('mongoose');

const overlaySettingSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      unique: true,
    },
    theme: {
      type: String,
      default: 'modern_dark',
    },
    primaryColor: {
      type: String,
      default: '#1E3A8A',
    },
    secondaryColor: {
      type: String,
      default: '#F59E0B',
    },
    showTeamLogos: {
      type: Boolean,
      default: true,
    },
    showPlayerNames: {
      type: Boolean,
      default: true,
    },
    showRecentBalls: {
      type: Boolean,
      default: true,
    },
    showTarget: {
      type: Boolean,
      default: true,
    },
    showSponsor: {
      type: Boolean,
      default: true,
    },
    showTicker: {
      type: Boolean,
      default: true,
    },
    tickerText: {
      type: String,
      default: 'Welcome to CrickoTV Live Broadcast',
    },
  },
  {
    timestamps: true,
  }
);

const OverlaySetting = mongoose.model('OverlaySetting', overlaySettingSchema);

module.exports = OverlaySetting;
