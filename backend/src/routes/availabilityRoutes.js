const express = require('express');
const router = express.Router();
const AvailabilityController = require('../controllers/availabilityController');
const authMiddleware = require('../middlewares/auth');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get('/date/:date', AvailabilityController.getAvailabilityByDate);
router.get('/available/:date', AvailabilityController.getAvailableSlots);
router.get('/booked/:date', AvailabilityController.getBookedSlots);
router.get('/range', AvailabilityController.getAvailabilityByDateRange);
router.get('/check', AvailabilityController.checkSlotAvailability);
router.get('/stats', AvailabilityController.getAvailabilityStats);
router.get('/:id', AvailabilityController.getAvailabilityById);

// ============================================
// ADMIN ONLY ROUTES
// ============================================
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('admin'));

router.post('/', AvailabilityController.createAvailability);
router.post('/bulk', AvailabilityController.createBulkAvailability);
router.post('/generate-weekly', AvailabilityController.generateWeeklyAvailability);
router.patch('/:id', AvailabilityController.updateAvailability);
router.delete('/:id', AvailabilityController.deleteAvailability);

module.exports = router;