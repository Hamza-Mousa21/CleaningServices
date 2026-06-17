const BookingService = require('../services/bookingService');
const { ErrorHandler, AppError } = require('../middlewares/errorHandler');

class BookingController {
  // Create booking (User)
  static createBooking = ErrorHandler.catchAsync(async (req, res) => {
    const bookingData = {
      ...req.body,
      userId: req.user.userId // Get userId from authenticated user
    };
    
    const booking = await BookingService.createBooking(bookingData);
    res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: { booking }
    });
  });

  // Get all bookings (Admin only)
  static getAllBookings = ErrorHandler.catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      status: req.query.status || null,
      userId: req.query.userId || null,
      serviceTypeId: req.query.serviceTypeId || null,
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null
    };

    const result = await BookingService.getAllBookings(page, limit, filters);
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get user bookings (User's own bookings)
  static getUserBookings = ErrorHandler.catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user.userId;

    const result = await BookingService.getUserBookings(userId, page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get booking by ID
  static getBookingById = ErrorHandler.catchAsync(async (req, res) => {
    const booking = await BookingService.getBookingById(req.params.id);
    
    // Check if user has access (own booking or admin)
    if (req.user.role !== 'admin' && booking.userId !== req.user.userId) {
      throw new AppError('You do not have permission to view this booking', 403);
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  });

  // Update booking status (Admin only)
  static updateBookingStatus = ErrorHandler.catchAsync(async (req, res) => {
    const { status } = req.body;
    
    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const booking = await BookingService.updateBookingStatus(req.params.id, status);
    res.status(200).json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: { booking }
    });
  });

  // Update booking (Admin only)
  static updateBooking = ErrorHandler.catchAsync(async (req, res) => {
    const booking = await BookingService.updateBooking(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Booking updated successfully',
      data: { booking }
    });
  });

  // Cancel booking (User)
  static cancelBooking = ErrorHandler.catchAsync(async (req, res) => {
    const result = await BookingService.cancelBooking(req.params.id, req.user.userId);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  // Delete booking (Admin only)
  static deleteBooking = ErrorHandler.catchAsync(async (req, res) => {
    const result = await BookingService.deleteBooking(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  // Get booking statistics (Admin only)
  static getBookingStats = ErrorHandler.catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    const stats = await BookingService.getBookingStats(startDate, endDate);
    res.status(200).json({
      status: 'success',
      data: stats
    });
  });

  // Get upcoming bookings
  static getUpcomingBookings = ErrorHandler.catchAsync(async (req, res) => {
    const userId = req.user.role === 'admin' ? req.query.userId || null : req.user.userId;
    const limit = parseInt(req.query.limit) || 5;
    
    const bookings = await BookingService.getUpcomingBookings(userId, limit);
    res.status(200).json({
      status: 'success',
      data: { bookings }
    });
  });
}

module.exports = BookingController;