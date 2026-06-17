const { Availability, Booking } = require('../../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');

class AvailabilityService {
  // Create single availability slot
  static async createAvailability(data) {
    const { availableDate, startTime, endTime } = data;

    // Validate required fields
    if (!availableDate) {
      throw new AppError('Available date is required', 400);
    }

    if (!startTime) {
      throw new AppError('Start time is required', 400);
    }

    if (!endTime) {
      throw new AppError('End time is required', 400);
    }

    // Check if slot already exists
    const existing = await Availability.findOne({
      where: {
        availableDate,
        startTime,
        endTime
      }
    });

    if (existing) {
      throw new AppError('This time slot already exists', 409);
    }

    const availability = await Availability.create({
      availableDate,
      startTime,
      endTime,
      isBooked: false
    });

    return availability;
  }

  // Create multiple availability slots (bulk)
  static async createBulkAvailability(slots) {
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      throw new AppError('Please provide an array of slots', 400);
    }

    const createdSlots = [];
    const errors = [];

    for (const slot of slots) {
      try {
        const { availableDate, startTime, endTime } = slot;

        if (!availableDate || !startTime || !endTime) {
          errors.push({ slot, error: 'Missing required fields' });
          continue;
        }

        // Check if slot already exists
        const existing = await Availability.findOne({
          where: {
            availableDate,
            startTime,
            endTime
          }
        });

        if (existing) {
          errors.push({ slot, error: 'Slot already exists' });
          continue;
        }

        const created = await Availability.create({
          availableDate,
          startTime,
          endTime,
          isBooked: false
        });

        createdSlots.push(created);
      } catch (error) {
        errors.push({ slot, error: error.message });
      }
    }

    return {
      created: createdSlots,
      errors: errors,
      total: slots.length,
      createdCount: createdSlots.length,
      errorCount: errors.length
    };
  }

  // Generate weekly availability slots
  static async generateWeeklyAvailability(startDate, numDays = 7) {
    if (!startDate) {
      throw new AppError('Start date is required', 400);
    }

    const slots = [];
    const start = new Date(startDate);

    for (let i = 0; i < numDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Skip if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        continue;
      }

      // Check if slots already exist for this date
      const existingSlots = await Availability.findAll({
        where: { availableDate: dateStr }
      });

      if (existingSlots.length > 0) {
        continue; // Skip if slots already exist for this date
      }

      // Building slots (3 hours each)
      slots.push({
        availableDate: dateStr,
        startTime: '09:00:00',
        endTime: '12:00:00',
        isBooked: false
      });
      slots.push({
        availableDate: dateStr,
        startTime: '13:00:00',
        endTime: '16:00:00',
        isBooked: false
      });

      // Garden slots (full day)
      slots.push({
        availableDate: dateStr,
        startTime: '09:00:00',
        endTime: '17:00:00',
        isBooked: false
      });
    }

    if (slots.length === 0) {
      return {
        message: 'No new slots created. Slots may already exist for these dates.',
        created: []
      };
    }

    const createdSlots = await Availability.bulkCreate(slots, {
      ignoreDuplicates: true
    });

    return {
      message: `Generated ${createdSlots.length} availability slots`,
      created: createdSlots,
      total: slots.length,
      createdCount: createdSlots.length
    };
  }

  // Get availability by date
  static async getAvailabilityByDate(date) {
    if (!date) {
      throw new AppError('Date is required', 400);
    }

    const slots = await Availability.findAll({
      where: {
        availableDate: date
      },
      order: [['startTime', 'ASC']]
    });

    return slots;
  }

  // Get available slots for a date
  static async getAvailableSlots(date) {
    if (!date) {
      throw new AppError('Date is required', 400);
    }

    const slots = await Availability.findAll({
      where: {
        availableDate: date,
        isBooked: false
      },
      order: [['startTime', 'ASC']]
    });

    return slots;
  }

  // Get booked slots for a date
  static async getBookedSlots(date) {
    if (!date) {
      throw new AppError('Date is required', 400);
    }

    const slots = await Availability.findAll({
      where: {
        availableDate: date,
        isBooked: true
      },
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['bookingId', 'status', 'userId']
        }
      ],
      order: [['startTime', 'ASC']]
    });

    return slots;
  }

  // Get availability by date range
  static async getAvailabilityByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const slots = await Availability.findAll({
      where: {
        availableDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [
        ['availableDate', 'ASC'],
        ['startTime', 'ASC']
      ]
    });

    // Group by date
    const grouped = slots.reduce((acc, slot) => {
      const date = slot.availableDate;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {});

    return grouped;
  }

  // Get availability by ID
  static async getAvailabilityById(id) {
    const availability = await Availability.findByPk(id);
    if (!availability) {
      throw new AppError('Availability slot not found', 404);
    }
    return availability;
  }

  // Update availability slot
  static async updateAvailability(id, updateData) {
    const availability = await Availability.findByPk(id);
    if (!availability) {
      throw new AppError('Availability slot not found', 404);
    }

    // If slot is booked, prevent updates
    if (availability.isBooked) {
      throw new AppError('Cannot modify a booked slot', 400);
    }

    await availability.update(updateData);
    return availability;
  }

  // Delete availability slot
  static async deleteAvailability(id) {
    const availability = await Availability.findByPk(id);
    if (!availability) {
      throw new AppError('Availability slot not found', 404);
    }

    if (availability.isBooked) {
      throw new AppError('Cannot delete a booked slot', 400);
    }

    await availability.destroy();
    return { message: 'Availability slot deleted successfully' };
  }

  // Check if slot is available
  static async checkSlotAvailability(date, startTime, endTime) {
    if (!date || !startTime) {
      throw new AppError('Date and start time are required', 400);
    }

    const where = {
      availableDate: date,
      startTime,
      isBooked: false
    };

    if (endTime) {
      where.endTime = endTime;
    }

    const slot = await Availability.findOne({ where });
    return !!slot;
  }

  // Get availability statistics
  static async getAvailabilityStats(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const slots = await Availability.findAll({
      where: {
        availableDate: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    const total = slots.length;
    const booked = slots.filter(s => s.isBooked).length;
    const available = total - booked;

    return {
      total,
      booked,
      available,
      bookingRate: total > 0 ? ((booked / total) * 100).toFixed(2) : 0
    };
  }
}

module.exports = AvailabilityService;