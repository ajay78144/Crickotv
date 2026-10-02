const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    inningsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Innings',
      required: true,
      index: true,
    },
    inningsNumber: {
      type: Number,
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
    overNumber: {
      type: Number,
      required: true, // 0 for 1st over, 1 for 2nd over, etc.
    },
    ballNumber: {
      type: Number,
      required: true, // 1 to 6 for legal balls, or ball of over
    },
    strikerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    nonStrikerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    bowlerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    runsOffBat: {
      type: Number,
      default: 0,
      min: 0,
      max: 6,
    },
    extraRuns: {
      type: Number,
      default: 0,
      min: 0,
    },
    extraType: {
      type: String,
      enum: ['wide', 'no_ball', 'bye', 'leg_bye', 'penalty', null],
      default: null,
    },
    totalRuns: {
      type: Number,
      default: 0,
      min: 0,
    },
    isLegalDelivery: {
      type: Boolean,
      default: true,
    },
    isWicket: {
      type: Boolean,
      default: false,
    },
    wicketType: {
      type: String,
      enum: [
        'bowled',
        'caught',
        'lbw',
        'run_out',
        'stumped',
        'hit_wicket',
        'retired_out',
        null,
      ],
      default: null,
    },
    dismissedPlayerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    fielderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    runsCompleted: {
      type: Number,
      default: 0,
    },
    isFreeHit: {
      type: Boolean,
      default: false,
    },
    commentary: {
      type: String,
      default: '',
    },
    isUndone: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

deliverySchema.index({ matchId: 1, inningsId: 1, sequence: 1 }, { unique: true });
deliverySchema.index({ matchId: 1, isUndone: 1, sequence: -1 });

const Delivery = mongoose.model('Delivery', deliverySchema);

module.exports = Delivery;
