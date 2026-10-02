const { body } = require('express-validator');
const validate = require('./validate.middleware');

const createTeamValidator = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
  body('shortName')
    .trim()
    .notEmpty()
    .withMessage('Short name is required')
    .isLength({ min: 2, max: 5 })
    .withMessage('Short name must be between 2 and 5 characters'),
  body('country').optional().trim(),
  body('logo').optional().trim(),
  body('primaryColor').optional().isHexColor().withMessage('Primary color must be a valid hex color code'),
  body('secondaryColor').optional().isHexColor().withMessage('Secondary color must be a valid hex color code'),
  validate,
];

const updateTeamValidator = [
  body('name').optional().trim().notEmpty().withMessage('Team name cannot be empty'),
  body('shortName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage('Short name must be between 2 and 5 characters'),
  body('primaryColor').optional().isHexColor().withMessage('Primary color must be a valid hex color code'),
  body('secondaryColor').optional().isHexColor().withMessage('Secondary color must be a valid hex color code'),
  validate,
];

module.exports = {
  createTeamValidator,
  updateTeamValidator,
};
