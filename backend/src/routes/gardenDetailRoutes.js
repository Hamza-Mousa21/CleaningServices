const express = require('express');
const router = express.Router();
const GardenDetailController = require('../controllers/gardenDetailController');
const authMiddleware = require('../middlewares/auth');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================
router.get('/booking/:bookingId', GardenDetailController.getGardenDetailByBookingId);
router.get('/:id', GardenDetailController.getGardenDetailById);

// ============================================
// ADMIN ONLY ROUTES
// ============================================
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.restrictTo('admin'));

router.get('/', GardenDetailController.getAllGardenDetails);
router.post('/', GardenDetailController.createGardenDetail);
router.patch('/:id', GardenDetailController.updateGardenDetail);
router.delete('/:id', GardenDetailController.deleteGardenDetail);

module.exports = router;