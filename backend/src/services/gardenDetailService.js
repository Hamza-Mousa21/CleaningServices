const { GardenDetail, Booking, ServiceType } = require('../../models');
const { AppError } = require('../middlewares/errorHandler');

class GardenDetailService {
  // Create garden detail (usually called from booking creation)
  static async createGardenDetail(data) {
    const { bookingId, gardenSizeKm } = data;

    if (!bookingId) {
      throw new AppError('Booking ID is required', 400);
    }

    if (!gardenSizeKm || gardenSizeKm <= 0) {
      throw new AppError('Garden size must be greater than 0', 400);
    }

    // Check if booking exists
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if booking is for garden service
    const serviceType = await ServiceType.findByPk(booking.serviceTypeId);
    if (serviceType.category !== 'garden') {
      throw new AppError('This booking is not for a garden service', 400);
    }

    // Check if garden detail already exists
    const existing = await GardenDetail.findOne({
      where: { bookingId }
    });

    if (existing) {
      throw new AppError('Garden detail already exists for this booking', 409);
    }

    const gardenDetail = await GardenDetail.create({
      bookingId,
      gardenSizeKm
    });

    return gardenDetail;
  }

  // Get garden detail by ID
  static async getGardenDetailById(id) {
    const gardenDetail = await GardenDetail.findByPk(id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: ServiceType,
              as: 'serviceType'
            }
          ]
        }
      ]
    });

    if (!gardenDetail) {
      throw new AppError('Garden detail not found', 404);
    }

    return gardenDetail;
  }

  // Get garden detail by booking ID
  static async getGardenDetailByBookingId(bookingId) {
    const gardenDetail = await GardenDetail.findOne({
      where: { bookingId },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: ServiceType,
              as: 'serviceType'
            }
          ]
        }
      ]
    });

    if (!gardenDetail) {
      throw new AppError('Garden detail not found for this booking', 404);
    }

    return gardenDetail;
  }

  // Update garden detail
  static async updateGardenDetail(id, updateData) {
    const gardenDetail = await GardenDetail.findByPk(id);
    if (!gardenDetail) {
      throw new AppError('Garden detail not found', 404);
    }

    // Check if booking is still valid
    const booking = await Booking.findByPk(gardenDetail.bookingId);
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      throw new AppError(`Cannot update garden detail for a ${booking.status} booking`, 400);
    }

    if (updateData.gardenSizeKm && updateData.gardenSizeKm <= 0) {
      throw new AppError('Garden size must be greater than 0', 400);
    }

    await gardenDetail.update(updateData);
    return gardenDetail;
  }

  // Delete garden detail
  static async deleteGardenDetail(id) {
    const gardenDetail = await GardenDetail.findByPk(id);
    if (!gardenDetail) {
      throw new AppError('Garden detail not found', 404);
    }

    // Check if booking is still valid
    const booking = await Booking.findByPk(gardenDetail.bookingId);
    if (booking && (booking.status === 'cancelled' || booking.status === 'completed')) {
      throw new AppError(`Cannot delete garden detail for a ${booking.status} booking`, 400);
    }

    await gardenDetail.destroy();
    return { message: 'Garden detail deleted successfully' };
  }

  // Get all garden details with pagination
  static async getAllGardenDetails(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await GardenDetail.findAndCountAll({
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: ServiceType,
              as: 'serviceType'
            }
          ]
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      gardenDetails: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }
}

module.exports = GardenDetailService;