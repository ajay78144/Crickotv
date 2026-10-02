const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    return errorResponse(res, 401, error.message);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 201, 'User registered successfully', result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return successResponse(res, 200, 'Current user retrieved', user);
  } catch (error) {
    return errorResponse(res, 404, error.message);
  }
};

const logout = async (req, res) => {
  return successResponse(res, 200, 'Logout successful');
};

module.exports = {
  login,
  register,
  getMe,
  logout,
};
