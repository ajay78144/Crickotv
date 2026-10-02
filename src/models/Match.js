const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      default: null,
    },
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team A is required'],
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team B is required'],
    },
    matchNumber: {
      type: String,
      default: 'Match 1',
    },
    matchType: {
      type: String,
      enum: ['T20', 'ODI', 'TEST', 'T10'],
      default: 'T20',
    },
    totalOvers: {
      type: Number,
      default: 20,
      min: [1, 'Total overs must be at least 1'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    time: {
      type: String,
      default: '19:30',
    },
    venue: {
      type: String,
      default: 'Wankhede Stadium, Mumbai',
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'scheduled',
        'toss',
        'live',
        'innings_break',
        'completed',
        'abandoned',
        'paused',
      ],
      default: 'scheduled',
    },
    toss: {
      winnerTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null,
      },
      decision: {
        type: String,
        enum: ['bat', 'bowl', null],
        default: null,
      },
      summary: {
        type: String,
        default: '',
      },
      battingFirstTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null,
      },
      bowlingFirstTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null,
      },
    },
    playingXI: {
      teamA: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
        },
      ],
      teamB: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
        },
      ],
    },
    currentInnings: {
      type: Number,
      default: 0, // 0: not started, 1: first innings, 2: second innings
    },
    scoreMode: {
      type: String,
      enum: ['manual', 'api', 'hybrid'],
      default: 'manual',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    result: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
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

matchSchema.index({ status: 1 });
matchSchema.index({ date: -1 });
matchSchema.index({ tournamentId: 1 });
matchSchema.index({ teamA: 1, teamB: 1 });

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
