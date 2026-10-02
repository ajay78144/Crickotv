const { body, param } = require('express-validator');
const validate = require('./validate.middleware');

const createMatchValidator = [
  body('teamA').isMongoId().withMessage('Valid teamA ID is required'),
  body('teamB')
    .isMongoId()
    .withMessage('Valid teamB ID is required')
    .custom((value, { req }) => {
      if (value === req.body.teamA) {
        throw new Error('Team A and Team B cannot be the same');
      }
      return true;
    }),
  body('totalOvers')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Total overs must be between 1 and 100'),
  body('matchType')
    .optional()
    .isIn(['T20', 'ODI', 'TEST', 'T10'])
    .withMessage('Match type must be T20, ODI, TEST, or T10'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  validate,
];

const playingXIValidator = [
  body('teamA')
    .isArray({ min: 11, max: 11 })
    .withMessage('Team A playing XI must contain exactly 11 players'),
  body('teamB')
    .isArray({ min: 11, max: 11 })
    .withMessage('Team B playing XI must contain exactly 11 players'),
  body('teamA.*').isMongoId().withMessage('Each Team A player must be a valid MongoId'),
  body('teamB.*').isMongoId().withMessage('Each Team B player must be a valid MongoId'),
  body('teamA').custom((players) => {
    const unique = new Set(players);
    if (unique.size !== 11) {
      throw new Error('Team A playing XI contains duplicate players');
    }
    return true;
  }),
  body('teamB').custom((players) => {
    const unique = new Set(players);
    if (unique.size !== 11) {
      throw new Error('Team B playing XI contains duplicate players');
    }
    return true;
  }),
  validate,
];

const tossValidator = [
  body('winnerTeamId').isMongoId().withMessage('Valid winnerTeamId is required'),
  body('decision')
    .isIn(['bat', 'bowl'])
    .withMessage("Toss decision must be 'bat' or 'bowl'"),
  validate,
];

const startMatchValidator = [
  body('strikerId').isMongoId().withMessage('Valid strikerId is required'),
  body('nonStrikerId')
    .isMongoId()
    .withMessage('Valid nonStrikerId is required')
    .custom((value, { req }) => {
      if (value === req.body.strikerId) {
        throw new Error('Striker and Non-striker must be different players');
      }
      return true;
    }),
  body('bowlerId').isMongoId().withMessage('Valid bowlerId is required'),
  validate,
];

const selectBatsmanValidator = [
  body('playerId').isMongoId().withMessage('Valid playerId is required'),
  validate,
];

const selectBowlerValidator = [
  body('playerId').isMongoId().withMessage('Valid playerId is required'),
  validate,
];

module.exports = {
  createMatchValidator,
  playingXIValidator,
  tossValidator,
  startMatchValidator,
  selectBatsmanValidator,
  selectBowlerValidator,
};
