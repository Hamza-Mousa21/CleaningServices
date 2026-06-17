const BuildingDetailService = require('../services/buildingDetailService');
const { ErrorHandler, AppError } = require('../middlewares/errorHandler');

class BuildingDetailController {
  // Create building detail (Admin only)
  static createBuildingDetail = ErrorHandler.catchAsync(async (req, res) => {
    const buildingDetail = await BuildingDetailService.createBuildingDetail(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Building detail created successfully',
      data: { buildingDetail }
    });
  });

  // Get building detail by ID
  static getBuildingDetailById = ErrorHandler.catchAsync(async (req, res) => {
    const buildingDetail = await BuildingDetailService.getBuildingDetailById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { buildingDetail }
    });
  });

  // Get building detail by booking ID
  static getBuildingDetailByBookingId = ErrorHandler.catchAsync(async (req, res) => {
    const { bookingId } = req.params;
    const buildingDetail = await BuildingDetailService.getBuildingDetailByBookingId(bookingId);
    res.status(200).json({
      status: 'success',
      data: { buildingDetail }
    });
  });

  // Get all building details (Admin only)
  static getAllBuildingDetails = ErrorHandler.catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await BuildingDetailService.getAllBuildingDetails(page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Update building detail (Admin only)
  static updateBuildingDetail = ErrorHandler.catchAsync(async (req, res) => {
    const buildingDetail = await BuildingDetailService.updateBuildingDetail(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Building detail updated successfully',
      data: { buildingDetail }
    });
  });

  // Delete building detail (Admin only)
  static deleteBuildingDetail = ErrorHandler.catchAsync(async (req, res) => {
    const result = await BuildingDetailService.deleteBuildingDetail(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });
}

module.exports = BuildingDetailController;