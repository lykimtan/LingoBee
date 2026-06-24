const { VNPay } = require('vnpay');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Student = require('../models/Student');
const DiscountCode = require('../models/DiscountCode');
const crypto = require('crypto');
const logger = require('../utils/logger');

const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE || 'DUMMY_TMNCODE',
  secureSecret: process.env.VNP_HASHSECRET || 'DUMMY_SECRET',
  vnpayHost: process.env.VNP_URL,
  testMode: true,
});

/**
 * Helper: Kiểm tra mã giảm giá
 */
const checkDiscountCode = async (codeStr, courseId, studentId, basePrice) => {
  const codeDoc = await DiscountCode.findOne({ code: codeStr.toUpperCase().trim(), isActive: true });
  if (!codeDoc) return { isValid: false, message: 'Mã giảm giá không tồn tại hoặc đã bị khóa' };

  const now = new Date();
  if (now < codeDoc.validFrom || now > codeDoc.validTo) {
    return { isValid: false, message: 'Mã giảm giá đã hết hạn hoặc chưa đến ngày áp dụng' };
  }

  if (codeDoc.maxUsageTotal !== -1 && codeDoc.usageCount >= codeDoc.maxUsageTotal) {
    return { isValid: false, message: 'Mã giảm giá đã hết số lượt sử dụng' };
  }

  if (codeDoc.applicableCourses && codeDoc.applicableCourses.length > 0) {
    const isApplicable = codeDoc.applicableCourses.some(c => c.toString() === courseId.toString());
    if (!isApplicable) return { isValid: false, message: 'Mã giảm giá không áp dụng cho khóa học này' };
  }

  if (studentId) {
    const studentUsage = codeDoc.usedBy.find(u => u.studentId.toString() === studentId.toString());
    if (studentUsage && studentUsage.usageCount >= codeDoc.maxUsagePerStudent) {
      return { isValid: false, message: 'Bạn đã hết lượt sử dụng mã giảm giá này' };
    }

    // Custom logic cho mã NEWBIE10 (14 ngày đầu)
    if (codeDoc.code === 'NEWBIE10') {
      const studentProfile = await Student.findById(studentId);
      if (studentProfile && studentProfile.createdAt) {
        const diffTime = Math.abs(now - studentProfile.createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 14) {
          return { isValid: false, message: 'Mã chỉ dành cho tài khoản mới trong 14 ngày đầu' };
        }
      }
    }
  }

  let discountAmount = 0;
  if (codeDoc.discountType === 'fixed') {
    discountAmount = codeDoc.discountValue;
  } else if (codeDoc.discountType === 'percentage') {
    discountAmount = (basePrice * codeDoc.discountValue) / 100;
  }

  // Giới hạn số tiền giảm tối đa (nếu có)
  if (codeDoc.maxDiscountAmount !== null && codeDoc.maxDiscountAmount !== undefined) {
    if (discountAmount > codeDoc.maxDiscountAmount) {
      discountAmount = codeDoc.maxDiscountAmount;
    }
  }

  if (discountAmount > basePrice) discountAmount = basePrice; // Không giảm quá giá gốc

  return { isValid: true, discountAmount, discountType: codeDoc.discountType, discountValue: codeDoc.discountValue, codeId: codeDoc._id };
};

/**
 * API: Kiểm tra mã giảm giá (Dành cho Frontend)
 */
exports.verifyDiscount = async (req, res) => {
  try {
    const { courseId, code } = req.body;
    const userId = req.user.id || req.user._id;

    if (!courseId || !code) return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mã khóa học và mã giảm giá' });

    const student = await Student.findOne({ userId });
    if (!student) return res.status(403).json({ success: false, message: 'Chỉ học viên mới có thể sử dụng mã giảm giá' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });

    const basePrice = course.priceTiers?.[0]?.price;
    if (!basePrice) return res.status(400).json({ success: false, message: 'Khóa học chưa được cấu hình giá' });

    const result = await checkDiscountCode(code, courseId, student._id, basePrice);
    if (!result.isValid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const finalAmount = basePrice - result.discountAmount;

    return res.json({
      success: true,
      message: 'Áp dụng mã giảm giá thành công',
      data: {
        originalPrice: basePrice,
        discountAmount: result.discountAmount,
        finalAmount: finalAmount > 0 ? finalAmount : 0
      }
    });
  } catch (error) {
    logger.error(`Error in verifyDiscount: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi kiểm tra mã giảm giá' });
  }
};

/**
 * Tạo URL thanh toán VNPay
 */
exports.createPaymentUrl = async (req, res) => {
  try {
    const { courseId, priceTierName, discountCode } = req.body;
    const userId = req.user.id || req.user._id;

    // 1. Tìm hoặc tạo Student profile cho User này
    let student = await Student.findOne({ userId });
    if (!student) {
      if (req.user.role === 'student') {
        student = new Student({ userId });
        await student.save();
      } else {
        return res.status(403).json({ success: false, message: 'Chỉ học viên mới có thể mua khóa học' });
      }
    }

    // 2. Tìm Course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
    }

    // 3. Lấy giá tiền
    let priceTier = course.priceTiers[0];
    if (priceTierName) {
      const foundTier = course.priceTiers.find((t) => t.name === priceTierName);
      if (foundTier) priceTier = foundTier;
    }

    if (!priceTier) {
      return res.status(400).json({ success: false, message: 'Khóa học chưa được cấu hình giá' });
    }

    const amount = priceTier.price;
    let finalAmount = amount;
    let discountInfo = null;

    // 4. Kiểm tra mã giảm giá (nếu có)
    if (discountCode) {
      const discountResult = await checkDiscountCode(discountCode, course._id, student._id, amount);
      if (!discountResult.isValid) {
        return res.status(400).json({ success: false, message: discountResult.message });
      }
      finalAmount = amount - discountResult.discountAmount;
      if (finalAmount < 0) finalAmount = 0;

      discountInfo = {
        code: discountCode,
        discountAmount: discountResult.discountAmount,
        percentage: discountResult.discountType === 'percentage' ? discountResult.discountValue : 0,
        appliedDate: new Date(),
        codeId: discountResult.codeId
      };
    }

    // 5. Sinh mã giao dịch duy nhất
    const txnRef = `VNP_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // 6. Lưu vào MongoDB trạng thái Pending
    const payment = new Payment({
      studentId: student._id,
      courseId: course._id,
      priceTier: {
        name: priceTier.name,
        basePrice: priceTier.price,
      },
      totalAmount: amount,
      discountedAmount: discountInfo ? discountInfo.discountAmount : 0,
      finalAmount: finalAmount,
      paymentStatus: 'pending',
      paymentMethod: 'vnpay',
      txnRef: txnRef,
      discountCode: discountInfo || undefined
    });
    await payment.save();

    // 7. Tạo link thanh toán VNPay
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // Tính số tiền VNPay cần thanh toán
    const vnpAmount = finalAmount > 0 ? finalAmount : 0;

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: vnpAmount,
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan khoa hoc ${course.title.substring(0, 50)}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: process.env.VNP_RETURNURL,
      vnp_Locale: 'vn',
    });

    res.json({ success: true, data: { paymentUrl } });
  } catch (error) {
    logger.error(`Error in createPaymentUrl: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo link thanh toán' });
  }
};

/**
 * Hàm hỗ trợ: Cập nhật DB khi thanh toán thành công
 */
const processSuccessfulPayment = async (payment, reqQuery) => {
  if (payment.paymentStatus === 'completed' || payment.paymentStatus === 'failed') {
    return false;
  }

  payment.paymentStatus = 'completed';
  payment.paymentDate = new Date();
  payment.enrollmentDate = new Date();

  // Ghi danh học viên vào khóa học
  const student = await Student.findById(payment.studentId);
  if (student) {
    const isEnrolled = student.enrolledCourses.some(
      (ec) => ec.courseId.toString() === payment.courseId.toString()
    );
    if (!isEnrolled) {
      student.enrolledCourses.push({
        courseId: payment.courseId,
        enrollmentDate: new Date(),
        status: 'active',
      });
      await student.save();

      // Cập nhật totalStudents trong Course
      await Course.findByIdAndUpdate(payment.courseId, { $inc: { totalStudents: 1 } });
    }
  }

  // Cập nhật Discount Code (nếu có)
  if (payment.discountCode && payment.discountCode.codeId) {
    const discountDoc = await DiscountCode.findById(payment.discountCode.codeId);
    if (discountDoc) {
      discountDoc.usageCount += 1;

      const studentUsageIndex = discountDoc.usedBy.findIndex(u => u.studentId.toString() === payment.studentId.toString());
      if (studentUsageIndex >= 0) {
        discountDoc.usedBy[studentUsageIndex].usageCount += 1;
        discountDoc.usedBy[studentUsageIndex].usedAt = new Date();
      } else {
        discountDoc.usedBy.push({
          studentId: payment.studentId,
          usedAt: new Date(),
          usageCount: 1
        });
      }
      await discountDoc.save();
    }
  }

  if (reqQuery) {
    payment.vnpayData = reqQuery;
  }
  await payment.save();
  return true;
};

/**
 * Xử lý Return URL (Dành cho Frontend chuyển hướng)
 */
exports.vnpayReturn = async (req, res) => {
  try {
    const verify = vnpay.verifyReturnUrl(req.query);
    if (!verify.isVerified) {
      // Chữ ký không hợp lệ
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=invalid_signature`);
    }

    if (verify.isSuccess) {
      // Vì Sandbox không đổi được IPN URL, update DB luôn ở đây
      const { vnp_TxnRef, vnp_Amount } = req.query;
      const payment = await Payment.findOne({ txnRef: vnp_TxnRef });

      if (payment && payment.paymentStatus === 'pending') {
        const vnpAmountValue = Number(vnp_Amount) / 100;
        if (vnpAmountValue === payment.finalAmount) {
          await processSuccessfulPayment(payment, req.query);
        }
      }

      return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
    } else {
      // User hủy hoặc lỗi thanh toán
      const txnRef = req.query.vnp_TxnRef;
      if (txnRef) {
        await Payment.findOneAndUpdate(
          { txnRef, paymentStatus: 'pending' },
          { paymentStatus: 'failed' }
        );
      }
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=payment_error`);
    }
  } catch (error) {
    logger.error(`Error in vnpayReturn: ${error.message}`);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reason=system_error`);
  }
};

/**
 * Xử lý Webhook IPN (Server-to-Server)
 */
exports.vnpayIpn = async (req, res) => {
  try {
    const verify = vnpay.verifyIpnCall(req.query);

    if (!verify.isVerified) {
      return res.json({ RspCode: '97', Message: 'Fail checksum' });
    }

    const { vnp_TxnRef, vnp_Amount, vnp_ResponseCode } = req.query;

    const payment = await Payment.findOne({ txnRef: vnp_TxnRef });
    if (!payment) {
      return res.json({ RspCode: '01', Message: 'Order not found' });
    }

    if (payment.paymentStatus === 'completed' || payment.paymentStatus === 'failed') {
      return res.json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    // Kiểm tra số tiền (vnp_Amount nhân 100)
    const vnpAmountValue = Number(vnp_Amount) / 100;
    if (vnpAmountValue !== payment.finalAmount) {
      return res.json({ RspCode: '04', Message: 'Invalid amount' });
    }

    // Cập nhật trạng thái
    if (vnp_ResponseCode === '00') {
      await processSuccessfulPayment(payment, req.query);
    } else {
      payment.paymentStatus = 'failed';
      payment.vnpayData = req.query;
      await payment.save();
    }

    return res.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch (error) {
    logger.error(`Error in vnpayIpn: ${error.message}`);
    return res.json({ RspCode: '99', Message: 'Unknown error' });
  }
};
