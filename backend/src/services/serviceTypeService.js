const { ServiceType } = require('../../models');
const { AppError } = require('../middlewares/errorHandler');

class ServiceTypeService {
  // Create service type
  static async createServiceType(data) {
    const { serviceName, category, durationHours, pricePerUnit, pricePerKm } = data;

    // Validate category
    if (!['garden', 'building'].includes(category)) {
      throw new AppError('Category must be either "garden" or "building"', 400);
    }

    // Validate pricing based on category
    if (category === 'building') {
      if (!pricePerUnit || pricePerUnit <= 0) {
        throw new AppError('Building services require a valid price per unit', 400);
      }
    }

    if (category === 'garden') {
      if (!pricePerKm || pricePerKm <= 0) {
        throw new AppError('Garden services require a valid price per km', 400);
      }
    }

    const serviceType = await ServiceType.create({
      serviceName,
      description: data.description || null,
      category,
      durationHours,
      pricePerUnit: pricePerUnit || null,
      pricePerKm: pricePerKm || null
    });

    return serviceType;
  }

  // Get all service types
  static async getAllServiceTypes(page = 1, limit = 10, category = null) {
    const offset = (page - 1) * limit;
    
    const where = {};
    if (category) {
      where.category = category;
    }

    const { count, rows } = await ServiceType.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      serviceTypes: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Get service type by ID
  static async getServiceTypeById(id) {
    const serviceType = await ServiceType.findByPk(id);
    if (!serviceType) {
      throw new AppError('Service type not found', 404);
    }
    return serviceType;
  }

  // Update service type
  static async updateServiceType(id, updateData) {
    const serviceType = await ServiceType.findByPk(id);
    if (!serviceType) {
      throw new AppError('Service type not found', 404);
    }

    // Validate category if being updated
    if (updateData.category && !['garden', 'building'].includes(updateData.category)) {
      throw new AppError('Category must be either "garden" or "building"', 400);
    }

    await serviceType.update(updateData);
    return serviceType;
  }

  // Delete service type (soft delete)
  static async deleteServiceType(id) {
    const serviceType = await ServiceType.findByPk(id);
    if (!serviceType) {
      throw new AppError('Service type not found', 404);
    }

    await serviceType.destroy();
    return { message: 'Service type deleted successfully' };
  }
}

module.exports = ServiceTypeService;