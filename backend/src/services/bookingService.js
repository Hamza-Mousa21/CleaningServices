const { Booking, User, ServiceType, GardenDetail, BuildingDetail, Availability } = require('../../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

class BookingService {
  // Create booking
  static async createBooking(data) {
    const {
      userId,
      serviceTypeId,
      bookingDate,
      startTime,
      phoneNumber,
      address,
      specialInstructions,
      gardenSizeKm,
      numFloors
    } = data;

    // Validate required fields
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    if (!serviceTypeId) {
      throw new AppError('Service type ID is required', 400);
    }

    if (!bookingDate) {
      throw new AppError('Booking date is required', 400);
    }

    if (!startTime) {
      throw new AppError('Start time is required', 400);
    }

    if (!phoneNumber) {
      throw new AppError('Phone number is required', 400);
    }

    if (!address) {
      throw new AppError('Address is required', 400);
    }

    // Get service type details
    const serviceType = await ServiceType.findByPk(serviceTypeId);
    if (!serviceType) {
      throw new AppError('Service type not found', 404);
    }

    // Check if slot is available
    const availability = await Availability.findOne({
      where: {
        availableDate: bookingDate,
        startTime: startTime,
        isBooked: false
      }
    });

    if (!availability) {
      throw new AppError('Selected time slot is not available', 400);
    }

    // Calculate end time based on service duration
    const startDateTime = new Date(`2000-01-01T${startTime}`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + serviceType.durationHours);
    const endTime = endDateTime.toTimeString().slice(0, 8);

    // Calculate price based on service type
    let totalPrice = 0;
    if (serviceType.category === 'building') {
      // Building: price per floor * number of floors
      if (!numFloors) {
        throw new AppError('Number of floors is required for building service', 400);
      }
      if (numFloors <= 0) {
        throw new AppError('Number of floors must be greater than 0', 400);
      }
      totalPrice = serviceType.pricePerUnit * numFloors;
    } else if (serviceType.category === 'garden') {
      // Garden: price based on size
      if (!gardenSizeKm) {
        throw new AppError('Garden size is required for garden service', 400);
      }
      if (gardenSizeKm <= 0) {
        throw new AppError('Garden size must be greater than 0', 400);
      }
      totalPrice = serviceType.pricePerKm;
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      serviceTypeId,
      bookingDate,
      startTime,
      endTime,
      phoneNumber,
      address,
      totalPrice,
      status: 'pending',
      specialInstructions: specialInstructions || null
    });

    // Create specific details based on service type
    if (serviceType.category === 'garden') {
      await GardenDetail.create({
        bookingId: booking.bookingId,
        gardenSizeKm
      });
    } else if (serviceType.category === 'building') {
      await BuildingDetail.create({
        bookingId: booking.bookingId,
        numFloors
      });
    }

    // Mark availability as booked
    await availability.update({
      isBooked: true,
      bookingId: booking.bookingId
    });

    // Get complete booking with all details
    const completeBooking = await Booking.findByPk(booking.bookingId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'fullName', 'email']
        },
        {
          model: ServiceType,
          as: 'serviceType'
        },
        {
          model: GardenDetail,
          as: 'gardenDetail'
        },
        {
          model: BuildingDetail,
          as: 'buildingDetail'
        },
        {
          model: Availability,
          as: 'availability'
        }
      ]
    });

    return completeBooking;
  }

  // Get all bookings (with filters)
  static async getAllBookings(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.serviceTypeId) {
      where.serviceTypeId = filters.serviceTypeId;
    }

    if (filters.startDate && filters.endDate) {
      where.bookingDate = {
        [Op.between]: [filters.startDate, filters.endDate]
      };
    } else if (filters.startDate) {
      where.bookingDate = {
        [Op.gte]: filters.startDate
      };
    } else if (filters.endDate) {
      where.bookingDate = {
        [Op.lte]: filters.endDate
      };
    }

    const { count, rows } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'fullName', 'email']
        },
        {
          model: ServiceType,
          as: 'serviceType'
        },
        {
          model: GardenDetail,
          as: 'gardenDetail'
        },
        {
          model: BuildingDetail,
          as: 'buildingDetail'
        },
        {
          model: Availability,
          as: 'availability'
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      bookings: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Get booking by ID
  static async getBookingById(id) {
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'fullName', 'email']
        },
        {
          model: ServiceType,
          as: 'serviceType'
        },
        {
          model: GardenDetail,
          as: 'gardenDetail'
        },
        {
          model: BuildingDetail,
          as: 'buildingDetail'
        },
        {
          model: Availability,
          as: 'availability'
        }
      ]
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    return booking;
  }

  // Get user bookings
  static async getUserBookings(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Booking.findAndCountAll({
      where: { userId },
      include: [
        {
          model: ServiceType,
          as: 'serviceType'
        },
        {
          model: GardenDetail,
          as: 'gardenDetail'
        },
        {
          model: BuildingDetail,
          as: 'buildingDetail'
        },
        {
          model: Availability,
          as: 'availability'
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      bookings: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Update booking status
  static async updateBookingStatus(id, status) {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status. Valid statuses: ' + validStatuses.join(', '), 400);
    }

    // If cancelling, free up the availability slot
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const availability = await Availability.findOne({
        where: { bookingId: booking.bookingId }
      });
      
      if (availability) {
        await availability.update({
          isBooked: false,
          bookingId: null
        });
      }
    }

    await booking.update({ status });
    return booking;
  }

  // Update booking (full update) - Admin only
  static async updateBooking(id, updateData) {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Don't allow updating cancelled or completed bookings
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      throw new AppError(`Cannot update a ${booking.status} booking`, 400);
    }

    // If updating date/time, check availability
    if (updateData.bookingDate || updateData.startTime) {
      const newDate = updateData.bookingDate || booking.bookingDate;
      const newTime = updateData.startTime || booking.startTime;
      
      const availability = await Availability.findOne({
        where: {
          availableDate: newDate,
          startTime: newTime,
          isBooked: false
        }
      });

      if (!availability) {
        throw new AppError('Selected time slot is not available', 400);
      }

      // Free old slot
      const oldAvailability = await Availability.findOne({
        where: { bookingId: booking.bookingId }
      });
      
      if (oldAvailability) {
        await oldAvailability.update({
          isBooked: false,
          bookingId: null
        });
      }

      // Book new slot
      await availability.update({
        isBooked: true,
        bookingId: booking.bookingId
      });
    }

    await booking.update(updateData);
    return booking;
  }

  // Cancel booking (User)
  static async cancelBooking(id, userId) {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if user owns the booking
    if (booking.userId !== userId) {
      throw new AppError('You are not authorized to cancel this booking', 403);
    }

    if (booking.status === 'cancelled') {
      throw new AppError('Booking is already cancelled', 400);
    }

    if (booking.status === 'completed') {
      throw new AppError('Cannot cancel a completed booking', 400);
    }

    // Free up the availability slot
    const availability = await Availability.findOne({
      where: { bookingId: booking.bookingId }
    });
    
    if (availability) {
      await availability.update({
        isBooked: false,
        bookingId: null
      });
    }

    await booking.update({ status: 'cancelled' });
    return { message: 'Booking cancelled successfully' };
  }

  // Delete booking (Admin only - hard delete)
  static async deleteBooking(id) {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Free up the availability slot if not cancelled
    if (booking.status !== 'cancelled') {
      const availability = await Availability.findOne({
        where: { bookingId: booking.bookingId }
      });
      
      if (availability) {
        await availability.update({
          isBooked: false,
          bookingId: null
        });
      }
    }

    await booking.destroy();
    return { message: 'Booking deleted successfully' };
  }

  // Get booking statistics
  static async getBookingStats(startDate, endDate) {
    const where = {};
    if (startDate && endDate) {
      where.bookingDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const bookings = await Booking.findAll({ where });
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const inProgress = bookings.filter(b => b.status === 'in-progress').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

    return {
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      totalRevenue,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
    };
  }

  // Get upcoming bookings
  static async getUpcomingBookings(userId = null, limit = 5) {
    const where = {
      bookingDate: {
        [Op.gte]: new Date().toISOString().split('T')[0]
      },
      status: {
        [Op.in]: ['pending', 'confirmed']
      }
    };

    if (userId) {
      where.userId = userId;
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        {
          model: ServiceType,
          as: 'serviceType'
        },
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'fullName', 'email']
        }
      ],
      order: [
        ['bookingDate', 'ASC'],
        ['startTime', 'ASC']
      ],
      limit
    });

    return bookings;
  }
}

module.exports = BookingService;