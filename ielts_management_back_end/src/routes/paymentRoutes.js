const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, isStudent } = require('../middleware/authMiddleware');

// Route 1: Khởi tạo URL thanh toán VNPay (Cần đăng nhập và là học viên)
router.post('/create-payment-url', authMiddleware, isStudent, paymentController.createPaymentUrl);

// Route 2: Xử lý redirect từ VNPay sau khi thanh toán (Public - Trình duyệt gọi)
router.get('/vnpay-return', paymentController.vnpayReturn);

// Route 3: Webhook IPN xử lý kết quả ngầm (Public - VNPay gọi)
router.get('/vnpay-ipn', paymentController.vnpayIpn);

// Route 4: Kiểm tra mã giảm giá
router.post('/verify-discount', authMiddleware, isStudent, paymentController.verifyDiscount);

module.exports = router;
