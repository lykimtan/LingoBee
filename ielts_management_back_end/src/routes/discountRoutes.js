const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');

// All discount code management routes require Admin authentication
router.use(authMiddleware, isAdmin);

router.get('/', discountController.getDiscounts);
router.get('/stats', discountController.getDiscountStats);
router.post('/', discountController.createDiscount);
router.get('/:id', discountController.getDiscountById);
router.put('/:id', discountController.updateDiscount);
router.patch('/:id/toggle-status', discountController.toggleDiscountStatus);
router.post('/:id/send-email', discountController.sendDiscountEmail);
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;
