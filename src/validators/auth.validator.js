const { body } = require('express-validator');
const validate = require('./validate.middleware');

const loginValidator = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'scorer'])
    .withMessage('Invalid role'),
  validate,
];

module.exports = {
  loginValidator,
  registerValidator,
};
