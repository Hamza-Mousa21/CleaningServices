const { BuildingDetail, Booking, ServiceType } = require('../../models');
const { AppError } = require('../middlewares/errorHandler');

class BuildingDetailService {
  // Create building detail (usually called from booking creation)
  static async createBuildingDetail(data) {
    const { bookingId, numFloors } = data;

    if (!bookingId) {
      throw new AppError('Booking ID is required', 400);
    }

    if (!numFloors || numFloors <= 0) {
      throw new AppError('Number of floors must be greater than 0', 400);
    }

    // Check if booking exists
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Check if booking is for building service
    const serviceType = await ServiceType.findByPk(booking.serviceTypeId);
    if (serviceType.category !== 'building') {
      throw new AppError('This booking is not for a building service', 400);
    }

    // Check if building detail already exists
    const existing = await BuildingDetail.findOne({
      where: { bookingId }
    });

    if (existing) {
      throw new AppError('Building detail already exists for this booking', 409);
    }

    const buildingDetail = await BuildingDetail.create({
      bookingId,
      numFloors
    });

    return buildingDetail;
  }

  // Get building detail by ID
  static async getBuildingDetailById(id) {
    const buildingDetail = await BuildingDetail.findByPk(id, {
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

    if (!buildingDetail) {
      throw new AppError('Building detail not found', 404);
    }

    return buildingDetail;
  }

  // Get building detail by booking ID
  static async getBuildingDetailByBookingId(bookingId) {
    const buildingDetail = await BuildingDetail.findOne({
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

    if (!buildingDetail) {
      throw new AppError('Building detail not found for this booking', 404);
    }

    return buildingDetail;
  }

  // Update building detail
  static async updateBuildingDetail(id, updateData) {
    const buildingDetail = await BuildingDetail.findByPk(id);
    if (!buildingDetail) {
      throw new AppError('Building detail not found', 404);
    }

    // Check if booking is still valid
    const booking = await Booking.findByPk(buildingDetail.bookingId);
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      throw new AppError(`Cannot update building detail for a ${booking.status} booking`, 400);
    }

    if (updateData.numFloors && updateData.numFloors <= 0) {
      throw new AppError('Number of floors must be greater than 0', 400);
    }

    await buildingDetail.update(updateData);
    return buildingDetail;
  }

  // Delete building detail
  static async deleteBuildingDetail(id) {
    const buildingDetail = await BuildingDetail.findByPk(id);
    if (!buildingDetail) {
      throw new AppError('Building detail not found', 404);
    }

    // Check if booking is still valid
    const booking = await Booking.findByPk(buildingDetail.bookingId);
    if (booking && (booking.status === 'cancelled' || booking.status === 'completed')) {
      throw new AppError(`Cannot delete building detail for a ${booking.status} booking`, 400);
    }

    await buildingDetail.destroy();
    return { message: 'Building detail deleted successfully' };
  }

  // Get all building details with pagination
  static async getAllBuildingDetails(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await BuildingDetail.findAndCountAll({
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
      buildingDetails: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }
}

module.exports = BuildingDetailService;