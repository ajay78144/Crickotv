const { body, param, query } = require('express-validator');
const validate = require('./validate.middleware');

const createPlayerValidator = [
  body('name').trim().notEmpty().withMessage('Player name is required'),
  body('teamId').isMongoId().withMessage('Valid teamId is required'),
  body('role')
    .optional()
    .isIn(['batsman', 'bowler', 'all_rounder', 'wicket_keeper'])
    .withMessage('Invalid player role'),
  body('jerseyNumber').optional().isInt({ min: 0, max: 999 }).withMessage('Jersey number must be a valid number'),
  body('battingStyle')
    .optional()
    .isIn(['right_hand', 'left_hand'])
    .withMessage('Batting style must be right_hand or left_hand'),
  body('bowlingStyle').optional().trim(),
  body('isCaptain').optional().isBoolean(),
  body('isWicketKeeper').optional().isBoolean(),
  validate,
];

const updatePlayerValidator = [
  body('name').optional().trim().notEmpty().withMessage('Player name cannot be empty'),
  body('teamId').optional().isMongoId().withMessage('Valid teamId is required'),
  body('role')
    .optional()
    .isIn(['batsman', 'bowler', 'all_rounder', 'wicket_keeper'])
    .withMessage('Invalid player role'),
  body('jerseyNumber').optional().isInt({ min: 0, max: 999 }).withMessage('Jersey number must be a valid number'),
  validate,
];

module.exports = {
  createPlayerValidator,
  updatePlayerValidator,
};
