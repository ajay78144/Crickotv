const { body } = require('express-validator');
const validate = require('./validate.middleware');

const recordDeliveryValidator = [
  body('runsOffBat')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Runs off bat must be between 0 and 6'),
  body('extraType')
    .optional({ nullable: true })
    .isIn(['wide', 'no_ball', 'bye', 'leg_bye', 'penalty', null])
    .withMessage('Invalid extra type'),
  body('extraRuns')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Extra runs must be a positive integer'),
  body('isWicket')
    .optional()
    .isBoolean()
    .withMessage('isWicket must be a boolean'),
  body('wicketType')
    .optional({ nullable: true })
    .isIn([
      'bowled',
      'caught',
      'lbw',
      'run_out',
      'stumped',
      'hit_wicket',
      'retired_out',
      null,
    ])
    .withMessage('Invalid wicket type'),
  body('dismissedPlayerId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('dismissedPlayerId must be a valid MongoId'),
  body('fielderId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('fielderId must be a valid MongoId'),
  body('expectedSequence')
    .optional()
    .isInt({ min: 1 })
    .withMessage('expectedSequence must be a positive integer'),
  validate,
];

module.exports = {
  recordDeliveryValidator,
};
