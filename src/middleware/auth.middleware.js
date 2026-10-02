const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized to access this route, token missing');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_crickotv_jwt_key_2026_change_in_production');

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'User belonging to this token no longer exists or is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Not authorized, token failed or expired');
  }
};

/**
 * Grant access to specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this route`
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
