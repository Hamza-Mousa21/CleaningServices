const ServiceTypeService = require('../services/serviceTypeService');
const { ErrorHandler, AppError } = require('../middlewares/errorHandler');

class ServiceTypeController {
  // Create service type (Admin only)
  static createServiceType = ErrorHandler.catchAsync(async (req, res) => {
    const serviceType = await ServiceTypeService.createServiceType(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Service type created successfully',
      data: { serviceType }
    });
  });

  // Get all service types (Public)
  static getAllServiceTypes = ErrorHandler.catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || null;
    
    const result = await ServiceTypeService.getAllServiceTypes(page, limit, category);
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Get all service types list (no pagination - for dropdowns)
  static getAllServiceTypesList = ErrorHandler.catchAsync(async (req, res) => {
    const serviceTypes = await ServiceTypeService.getAllServiceTypesList();
    res.status(200).json({
      status: 'success',
      data: { serviceTypes }
    });
  });

  // Get service types by category (Public)
  static getServiceTypesByCategory = ErrorHandler.catchAsync(async (req, res) => {
    const { category } = req.params;
    const serviceTypes = await ServiceTypeService.getServiceTypesByCategory(category);
    res.status(200).json({
      status: 'success',
      data: { serviceTypes }
    });
  });

  // Get service type by ID (Public)
  static getServiceTypeById = ErrorHandler.catchAsync(async (req, res) => {
    const serviceType = await ServiceTypeService.getServiceTypeById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { serviceType }
    });
  });

  // Update service type (Admin only)
  static updateServiceType = ErrorHandler.catchAsync(async (req, res) => {
    const serviceType = await ServiceTypeService.updateServiceType(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Service type updated successfully',
      data: { serviceType }
    });
  });

  // Delete service type (Admin only)
  static deleteServiceType = ErrorHandler.catchAsync(async (req, res) => {
    const result = await ServiceTypeService.deleteServiceType(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });
}

module.exports = ServiceTypeController;