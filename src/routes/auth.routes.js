const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginValidator, registerValidator } = require('../validators/auth.validator');

router.post('/login', authLimiter, loginValidator, authController.login);
router.post('/register', authLimiter, registerValidator, authController.register);
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;
