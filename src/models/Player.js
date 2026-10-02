const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Player name is required'],
      trim: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required'],
    },
    photo: {
      type: String,
      default: '',
    },
    jerseyNumber: {
      type: Number,
      default: null,
    },
    role: {
      type: String,
      enum: ['batsman', 'bowler', 'all_rounder', 'wicket_keeper'],
      default: 'batsman',
    },
    battingStyle: {
      type: String,
      enum: ['right_hand', 'left_hand'],
      default: 'right_hand',
    },
    bowlingStyle: {
      type: String,
      default: 'none',
    },
    isCaptain: {
      type: Boolean,
      default: false,
    },
    isWicketKeeper: {
      type: Boolean,
      default: false,
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

playerSchema.index({ teamId: 1 });
playerSchema.index({ role: 1 });
playerSchema.index({ name: 'text' });

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
