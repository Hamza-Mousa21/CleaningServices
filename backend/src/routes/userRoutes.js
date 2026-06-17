const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================
router.use(authMiddleware.verifyToken);

// User profile routes
router.get('/profile', UserController.getProfile);
router.patch('/change-password', UserController.changePassword);

// ============================================
// ADMIN ONLY ROUTES
// ============================================
router.use(authMiddleware.restrictTo('admin'));

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.patch('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;