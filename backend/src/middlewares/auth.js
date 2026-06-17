const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { AppError } = require('./errorHandler');

const authMiddleware = {
  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      let token;
      
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        throw new AppError('You are not logged in. Please log in to access this resource.', 401);
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        throw new AppError('The user belonging to this token no longer exists.', 401);
      }

      req.user = {
        userId: user.userId,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      next(error);
    }
  },

  // Restrict to specific roles
  restrictTo: (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return next(new AppError('You are not logged in', 401));
      }
      
      if (!roles.includes(req.user.role)) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
      
      next();
    };
  },

  // Check if user is admin
  isAdmin: (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Admin access required', 403));
    }
    next();
  }
};

module.exports = authMiddleware;