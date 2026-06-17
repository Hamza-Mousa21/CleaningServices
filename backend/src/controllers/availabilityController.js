const AvailabilityService = require('../services/availabilityService');
const { ErrorHandler, AppError } = require('../middlewares/errorHandler');

class AvailabilityController {
  // Create single availability slot (Admin only)
  static createAvailability = ErrorHandler.catchAsync(async (req, res) => {
    const availability = await AvailabilityService.createAvailability(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Availability slot created successfully',
      data: { availability }
    });
  });

  // Create bulk availability slots (Admin only)
  static createBulkAvailability = ErrorHandler.catchAsync(async (req, res) => {
    const { slots } = req.body;
    
    if (!slots) {
      throw new AppError('Slots array is required', 400);
    }

    const result = await AvailabilityService.createBulkAvailability(slots);
    res.status(201).json({
      status: 'success',
      message: 'Bulk availability created',
      data: result
    });
  });

  // Generate weekly availability (Admin only)
  static generateWeeklyAvailability = ErrorHandler.catchAsync(async (req, res) => {
    const { startDate, numDays } = req.query;
    
    if (!startDate) {
      throw new AppError('Start date is required', 400);
    }

    const days = parseInt(numDays) || 7;
    const result = await AvailabilityService.generateWeeklyAvailability(startDate, days);
    
    res.status(201).json({
      status: 'success',
      message: result.message,
      data: result
    });
  });

  // Get availability by date (Public)
  static getAvailabilityByDate = ErrorHandler.catchAsync(async (req, res) => {
    const { date } = req.params;
    const slots = await AvailabilityService.getAvailabilityByDate(date);
    res.status(200).json({
      status: 'success',
      data: {
        date,
        slots,
        count: slots.length
      }
    });
  });

  // Get available slots (Public)
  static getAvailableSlots = ErrorHandler.catchAsync(async (req, res) => {
    const { date } = req.params;
    const slots = await AvailabilityService.getAvailableSlots(date);
    res.status(200).json({
      status: 'success',
      data: {
        date,
        availableSlots: slots,
        count: slots.length
      }
    });
  });

  // Get booked slots (Public)
  static getBookedSlots = ErrorHandler.catchAsync(async (req, res) => {
    const { date } = req.params;
    const slots = await AvailabilityService.getBookedSlots(date);
    res.status(200).json({
      status: 'success',
      data: {
        date,
        bookedSlots: slots,
        count: slots.length
      }
    });
  });

  // Get availability by date range (Public)
  static getAvailabilityByDateRange = ErrorHandler.catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const slots = await AvailabilityService.getAvailabilityByDateRange(startDate, endDate);
    res.status(200).json({
      status: 'success',
      data: slots
    });
  });

  // Get availability by ID (Public)
  static getAvailabilityById = ErrorHandler.catchAsync(async (req, res) => {
    const availability = await AvailabilityService.getAvailabilityById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { availability }
    });
  });

  // Update availability (Admin only)
  static updateAvailability = ErrorHandler.catchAsync(async (req, res) => {
    const availability = await AvailabilityService.updateAvailability(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Availability slot updated successfully',
      data: { availability }
    });
  });

  // Delete availability (Admin only)
  static deleteAvailability = ErrorHandler.catchAsync(async (req, res) => {
    const result = await AvailabilityService.deleteAvailability(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });

  // Check slot availability (Public)
  static checkSlotAvailability = ErrorHandler.catchAsync(async (req, res) => {
    const { date, startTime, endTime } = req.query;
    
    if (!date || !startTime) {
      throw new AppError('Date and start time are required', 400);
    }

    const isAvailable = await AvailabilityService.checkSlotAvailability(date, startTime, endTime);
    res.status(200).json({
      status: 'success',
      data: {
        date,
        startTime,
        endTime: endTime || null,
        isAvailable
      }
    });
  });

  // Get availability statistics (Public)
  static getAvailabilityStats = ErrorHandler.catchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const stats = await AvailabilityService.getAvailabilityStats(startDate, endDate);
    res.status(200).json({
      status: 'success',
      data: stats
    });
  });
}

module.exports = AvailabilityController;