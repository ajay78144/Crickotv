const mongoose = require('mongoose');

const inningsSchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: [true, 'Match ID is required'],
    },
    inningsNumber: {
      type: Number,
      required: [true, 'Innings number is required'],
      enum: [1, 2],
    },
    battingTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Batting team is required'],
    },
    bowlingTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Bowling team is required'],
    },
    runs: {
      type: Number,
      default: 0,
      min: 0,
    },
    wickets: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    legalBalls: {
      type: Number,
      default: 0,
      min: 0,
    },
    extras: {
      wides: { type: Number, default: 0, min: 0 },
      noBalls: { type: Number, default: 0, min: 0 },
      byes: { type: Number, default: 0, min: 0 },
      legByes: { type: Number, default: 0, min: 0 },
      penalty: { type: Number, default: 0, min: 0 },
    },
    target: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['not_started', 'live', 'completed'],
      default: 'not_started',
    },
    strikerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    nonStrikerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    currentBowlerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    previousBowlerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    isFreeHit: {
      type: Boolean,
      default: false,
    },
    isOverComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

inningsSchema.index({ matchId: 1, inningsNumber: 1 }, { unique: true });

const Innings = mongoose.model('Innings', inningsSchema);

module.exports = Innings;
