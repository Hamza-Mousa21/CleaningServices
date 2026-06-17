const express = require('express');
const router = express.Router();
const BuildingDetailController = require('../controllers/buildingDetailController');
const authMiddleware = require('../middlewares/auth');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get('/booking/:bookingId', BuildingDetailController.getBuildingDetailByBookingId);
router.get('/:id', BuildingDetailController.getBuildingDetailById);

// ============================================
// ADMIN ONLY ROUTES
// ============================================
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('admin'));

router.get('/', BuildingDetailController.getAllBuildingDetails);
router.post('/', BuildingDetailController.createBuildingDetail);
router.patch('/:id', BuildingDetailController.updateBuildingDetail);
router.delete('/:id', BuildingDetailController.deleteBuildingDetail);

module.exports = router;