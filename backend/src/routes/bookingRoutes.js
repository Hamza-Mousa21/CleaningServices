const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/auth');

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================
router.use(authMiddleware.verifyToken);

// ============================================
// USER ROUTES (Authenticated users)
// ============================================
router.post('/', BookingController.createBooking);
router.get('/my-bookings', BookingController.getUserBookings);
router.get('/upcoming', BookingController.getUpcomingBookings);
router.get('/:id', BookingController.getBookingById);
router.patch('/:id/cancel', BookingController.cancelBooking);

// ============================================
// ADMIN ONLY ROUTES
// ============================================
router.use(authMiddleware.restrictTo('admin'));

router.get('/', BookingController.getAllBookings);
router.get('/stats', BookingController.getBookingStats);
router.patch('/:id/status', BookingController.updateBookingStatus);
router.patch('/:id', BookingController.updateBooking);
router.delete('/:id', BookingController.deleteBooking);

module.exports = router;