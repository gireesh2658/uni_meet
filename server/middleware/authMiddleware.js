const { verifyAccessToken } = require('../utils/generateToken');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    const decoded = verifyAccessToken(token);
    const currentUser = await User.findById(decoded.id).select('_id name email role isActive');
    
    if (!currentUser) {
      return errorResponse(res, 401, 'The user belonging to this token no longer exists');
    }

    if (!currentUser.isActive) {
      return errorResponse(res, 403, 'Your account has been suspended by an administrator');
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired, please refresh');
    }
    return errorResponse(res, 401, 'Not authorized, invalid token');
  }
};

module.exports = { protect };
