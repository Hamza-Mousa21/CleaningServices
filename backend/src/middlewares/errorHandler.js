class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ErrorHandler {
  static handleError(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Sequelize Validation Error
    if (err.name === 'SequelizeValidationError') {
      const message = err.errors.map(e => e.message).join('. ');
      err = new AppError(message, 400);
    }

    // Sequelize Unique Constraint Error
    if (err.name === 'SequelizeUniqueConstraintError') {
      const message = 'Duplicate entry. This value already exists.';
      err = new AppError(message, 409);
    }

    // Sequelize Foreign Key Error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      err = new AppError('Related record not found', 400);
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
      err = new AppError('Invalid token. Please log in again.', 401);
    }

    if (err.name === 'TokenExpiredError') {
      err = new AppError('Your token has expired. Please log in again.', 401);
    }

    // Development vs Production error response
    if (process.env.NODE_ENV === 'development') {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
      });
    } else {
      // Production
      res.status(err.statusCode).json({
        status: err.status,
        message: err.isOperational ? err.message : 'Something went wrong'
      });
    }
  }

  static catchAsync(fn) {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  }
}

module.exports = {
  AppError,
  ErrorHandler
};