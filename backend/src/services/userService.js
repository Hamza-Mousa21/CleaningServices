const { User } = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');
const { validateEmail, validatePassword } = require('../utils/validation');

class UserService {
  // Register new user
  static async register(userData) {
    const { fullName, email, password, role } = userData;

    // Validate email
    if (!validateEmail(email)) {
      throw new AppError('Please provide a valid email', 400);
    }

    // Validate password
    if (!validatePassword(password)) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email },
      paranoid: false // Include soft-deleted users
    });

    if (existingUser) {
      throw new AppError('User already exists with this email', 409);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      fullName,
      email,
      passwordHash: hashedPassword,
      role: role || 'user'
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    return userResponse;
  }

  // Login user
  static async login(email, password) {
    // Validate email
    if (!validateEmail(email)) {
      throw new AppError('Please provide a valid email', 400);
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.userId, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    return {
      user: userResponse,
      token
    };
  }

  // Get all users (Admin only)
  static async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['passwordHash'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      users: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Get user by ID
  static async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Update user
  static async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // If updating email, check if it's taken
    if (updateData.email && updateData.email !== user.email) {
      if (!validateEmail(updateData.email)) {
        throw new AppError('Please provide a valid email', 400);
      }

      const existingUser = await User.findOne({ 
        where: { email: updateData.email } 
      });
      if (existingUser) {
        throw new AppError('Email already in use', 409);
      }
    }

    // If updating password, hash it
    if (updateData.password) {
      if (!validatePassword(updateData.password)) {
        throw new AppError('Password must be at least 6 characters long', 400);
      }
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(updateData.password, saltRounds);
      delete updateData.password;
    }

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    return userResponse;
  }

  // Delete user (soft delete)
  static async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  // Get user profile
  static async getProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      throw new AppError('New password must be at least 6 characters long', 400);
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await user.update({ passwordHash: hashedPassword });

    return { message: 'Password changed successfully' };
  }
}

module.exports = UserService;