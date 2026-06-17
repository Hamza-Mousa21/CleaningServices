const GardenDetailService = require('../services/gardenDetailService');
const { ErrorHandler, AppError } = require('../middlewares/errorHandler');

class GardenDetailController {
  // Create garden detail (Admin only)
  static createGardenDetail = ErrorHandler.catchAsync(async (req, res) => {
    const gardenDetail = await GardenDetailService.createGardenDetail(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Garden detail created successfully',
      data: { gardenDetail }
    });
  });

  // Get garden detail by ID
  static getGardenDetailById = ErrorHandler.catchAsync(async (req, res) => {
    const gardenDetail = await GardenDetailService.getGardenDetailById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { gardenDetail }
    });
  });

  // Get garden detail by booking ID
  static getGardenDetailByBookingId = ErrorHandler.catchAsync(async (req, res) => {
    const { bookingId } = req.params;
    const gardenDetail = await GardenDetailService.getGardenDetailByBookingId(bookingId);
    res.status(200).json({
      status: 'success',
      data: { gardenDetail }
    });
  });

  // Get all garden details (Admin only)
  static getAllGardenDetails = ErrorHandler.catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await GardenDetailService.getAllGardenDetails(page, limit);
    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  // Update garden detail (Admin only)
  static updateGardenDetail = ErrorHandler.catchAsync(async (req, res) => {
    const gardenDetail = await GardenDetailService.updateGardenDetail(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Garden detail updated successfully',
      data: { gardenDetail }
    });
  });

  // Delete garden detail (Admin only)
  static deleteGardenDetail = ErrorHandler.catchAsync(async (req, res) => {
    const result = await GardenDetailService.deleteGardenDetail(req.params.id);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  });
}

module.exports = GardenDetailController;