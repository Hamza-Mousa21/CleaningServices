const express = require('express');
const router = express.Router();
const ServiceTypeController = require('../controllers/serviceTypeController');
const authMiddleware = require('../middlewares/auth');

// Public routes (anyone can view service types)
router.get('/', ServiceTypeController.getAllServiceTypes);
router.get('/:id', ServiceTypeController.getServiceTypeById);

// Protected routes (admin only)
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('admin'));

router.post('/', ServiceTypeController.createServiceType);
router.patch('/:id', ServiceTypeController.updateServiceType);
router.delete('/:id', ServiceTypeController.deleteServiceType);

module.exports = router;