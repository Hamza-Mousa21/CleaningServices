const UserService = require('../services/userService');
const { ErrorHandler, AppError } = require('../middlewares/errorHandler');

class UserController {
  // Register new user
  static register = ErrorHandler.catchAsync(async (req, res) => {
    const user = await UserService.register(req.body);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user }
    });
  });

  // Login user
  static login = ErrorHandler.catchAsync(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await UserService.login(email, password);
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result
    });
  });

  // Get all users (Admin only)
  static getAllUsers = ErrorHandler.catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await UserService.getAllUsers(page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get user by ID
  static getUserById = ErrorHandler.catchAsync(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  // Update user
  static updateUser = ErrorHandler.catchAsync(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user }
    });
  });

  // Delete user
  static deleteUser = ErrorHandler.catchAsync(async (req, res) => {
    const result = await UserService.deleteUser(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  // Get current user profile
  static getProfile = ErrorHandler.catchAsync(async (req, res) => {
    const user = await UserService.getProfile(req.user.userId);
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  // Change password
  static changePassword = ErrorHandler.catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    const result = await UserService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword
    );
    
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });
}

module.exports = UserController;