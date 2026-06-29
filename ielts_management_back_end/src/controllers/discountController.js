const DiscountCode = require('../models/DiscountCode');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { sendEmail } = require('../services/apiService');
const logger = require('../utils/logger');

/**
 * @desc    Get all discount codes (Admin)
 * @route   GET /api/discounts
 * @access  Private (Admin)
 */
exports.getDiscounts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { code: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query.isActive = true;
      query.validTo = { $gte: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.validTo = { $lt: new Date() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await DiscountCode.countDocuments(query);
    const discounts = await DiscountCode.find(query)
      .populate('applicableCourses', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: discounts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error(`Error in getDiscounts: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách mã khuyến mãi' });
  }
};

/**
 * @desc    Get single discount code by ID
 * @route   GET /api/discounts/:id
 * @access  Private (Admin)
 */
exports.getDiscountById = async (req, res) => {
  try {
    const discount = await DiscountCode.findById(req.params.id).populate('applicableCourses', 'title slug');
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }
    res.status(200).json({ success: true, data: discount });
  } catch (error) {
    logger.error(`Error in getDiscountById: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thông tin mã khuyến mãi' });
  }
};

/**
 * @desc    Create a new discount code
 * @route   POST /api/discounts
 * @access  Private (Admin)
 */
exports.createDiscount = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      maxUsageTotal,
      maxUsagePerStudent,
      validFrom,
      validTo,
      applicableCourses,
      isActive
    } = req.body;

    if (!code || !discountType || discountValue === undefined || !validFrom || !validTo) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' });
    }

    const formattedCode = code.toUpperCase().trim();
    const existingCode = await DiscountCode.findOne({ code: formattedCode });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Mã khuyến mãi này đã tồn tại trên hệ thống' });
    }

    const newDiscount = await DiscountCode.create({
      code: formattedCode,
      description: description || '',
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      maxUsageTotal: maxUsageTotal !== undefined ? Number(maxUsageTotal) : -1,
      maxUsagePerStudent: maxUsagePerStudent !== undefined ? Number(maxUsagePerStudent) : 1,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      applicableCourses: Array.isArray(applicableCourses) && applicableCourses.length > 0 ? applicableCourses : [],
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    logger.info(`Admin created new discount code: ${formattedCode}`);

    res.status(201).json({
      success: true,
      message: 'Tạo mã khuyến mãi thành công',
      data: newDiscount
    });
  } catch (error) {
    logger.error(`Error in createDiscount: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server khi tạo mã khuyến mãi' });
  }
};

/**
 * @desc    Update a discount code
 * @route   PUT /api/discounts/:id
 * @access  Private (Admin)
 */
exports.updateDiscount = async (req, res) => {
  try {
    const discount = await DiscountCode.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      maxUsageTotal,
      maxUsagePerStudent,
      validFrom,
      validTo,
      applicableCourses,
      isActive
    } = req.body;

    if (code && code.toUpperCase().trim() !== discount.code) {
      const formattedCode = code.toUpperCase().trim();
      const existingCode = await DiscountCode.findOne({ code: formattedCode, _id: { $ne: discount._id } });
      if (existingCode) {
        return res.status(400).json({ success: false, message: 'Mã khuyến mãi này đã tồn tại' });
      }
      discount.code = formattedCode;
    }

    if (description !== undefined) discount.description = description;
    if (discountType !== undefined) discount.discountType = discountType;
    if (discountValue !== undefined) discount.discountValue = Number(discountValue);
    if (maxDiscountAmount !== undefined) discount.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (maxUsageTotal !== undefined) discount.maxUsageTotal = Number(maxUsageTotal);
    if (maxUsagePerStudent !== undefined) discount.maxUsagePerStudent = Number(maxUsagePerStudent);
    if (validFrom !== undefined) discount.validFrom = new Date(validFrom);
    if (validTo !== undefined) discount.validTo = new Date(validTo);
    if (applicableCourses !== undefined) discount.applicableCourses = Array.isArray(applicableCourses) ? applicableCourses : [];
    if (isActive !== undefined) discount.isActive = Boolean(isActive);

    await discount.save();
    logger.info(`Admin updated discount code: ${discount.code}`);

    res.status(200).json({
      success: true,
      message: 'Cập nhật mã khuyến mãi thành công',
      data: discount
    });
  } catch (error) {
    logger.error(`Error in updateDiscount: ${error.message}`);
    res.status(500).json({ success: false, message: error.message || 'Lỗi server khi cập nhật mã khuyến mãi' });
  }
};

/**
 * @desc    Toggle discount active status
 * @route   PATCH /api/discounts/:id/toggle-status
 * @access  Private (Admin)
 */
exports.toggleDiscountStatus = async (req, res) => {
  try {
    const discount = await DiscountCode.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    logger.info(`Admin toggled discount code status ${discount.code} to ${discount.isActive}`);

    res.status(200).json({
      success: true,
      message: `Đã ${discount.isActive ? 'kích hoạt' : 'tạm dừng'} mã khuyến mãi`,
      data: discount
    });
  } catch (error) {
    logger.error(`Error in toggleDiscountStatus: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi thay đổi trạng thái mã khuyến mãi' });
  }
};

/**
 * @desc    Delete a discount code
 * @route   DELETE /api/discounts/:id
 * @access  Private (Admin)
 */
exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await DiscountCode.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }

    if (discount.usageCount > 0) {
      // Nếu đã có người dùng, chỉ tắt trạng thái thay vì xóa vĩnh viễn để bảo toàn lịch sử
      discount.isActive = false;
      await discount.save();
      return res.status(200).json({
        success: true,
        message: 'Mã khuyến mãi đã phát sinh giao dịch nên được chuyển sang trạng thái tạm dừng thay vì xóa vĩnh viễn.'
      });
    }

    await DiscountCode.findByIdAndDelete(req.params.id);
    logger.info(`Admin deleted discount code: ${discount.code}`);

    res.status(200).json({
      success: true,
      message: 'Xóa mã khuyến mãi thành công'
    });
  } catch (error) {
    logger.error(`Error in deleteDiscount: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa mã khuyến mãi' });
  }
};

/**
 * @desc    Get discount usage stats (Pie chart ratio)
 * @route   GET /api/discounts/stats
 * @access  Private (Admin)
 */
exports.getDiscountStats = async (req, res) => {
  try {
    const completedPayments = await Payment.find({ paymentStatus: 'completed' });
    const totalCompleted = completedPayments.length;
    let withDiscount = 0;
    const codeCountMap = {};

    completedPayments.forEach(pm => {
      const code = pm.discountCode?.code;
      const amt = pm.discountCode?.discountAmount || pm.discountedAmount || 0;
      if (code && code.trim() !== '' && amt > 0) {
        withDiscount += 1;
        codeCountMap[code] = (codeCountMap[code] || 0) + 1;
      }
    });

    const withoutDiscount = totalCompleted - withDiscount;

    const pieData = [
      { name: 'Có dùng mã ưu đãi', value: withDiscount, color: '#a855f7' },
      { name: 'Không dùng mã', value: withoutDiscount, color: '#10b981' }
    ];

    const topCodes = Object.keys(codeCountMap)
      .map(code => ({ name: code, count: codeCountMap[code] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalCompleted,
        withDiscount,
        withoutDiscount,
        usageRate: totalCompleted > 0 ? Math.round((withDiscount / totalCompleted) * 100) : 0,
        pieData,
        topCodes
      }
    });
  } catch (error) {
    logger.error(`Error in getDiscountStats: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê mã khuyến mãi' });
  }
};

/**
 * @desc    Send discount promo email via SendGrid
 * @route   POST /api/discounts/:id/send-email
 * @access  Private (Admin)
 */
exports.sendDiscountEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds, customMessage } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một học viên để gửi email' });
    }

    const discount = await DiscountCode.findById(id);
    if (!discount) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mã khuyến mãi' });
    }

    const validObjectIds = userIds.filter(id => typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/));
    const usersFromDb = validObjectIds.length > 0 ? await User.find({ _id: { $in: validObjectIds } }) : [];
    const foundDbEmails = new Set(usersFromDb.map(u => u.email?.toLowerCase()));

    const customEmails = userIds
      .filter(id => typeof id === 'string' && id.includes('@') && !foundDbEmails.has(id.toLowerCase()))
      .map(email => ({ email: email.trim(), name: email.split('@')[0] }));

    const recipients = [...usersFromDb, ...customEmails];

    if (recipients.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng hoặc email hợp lệ' });
    }

    const discountText = discount.discountType === 'percentage' 
      ? `Giảm ${discount.discountValue}% học phí` 
      : `Giảm ${new Intl.NumberFormat('vi-VN').format(discount.discountValue)} VNĐ`;

    const validToFormatted = discount.validTo 
      ? new Date(discount.validTo).toLocaleDateString('vi-VN') 
      : 'Không giới hạn';

    let successCount = 0;
    let failCount = 0;

    // Send email to each recipient
    await Promise.all(
      recipients.map(async (user) => {
        try {
          if (user.email) {
            await sendEmail(
              user.email,
              `🎁 Quà tặng ưu đãi học phí đặc biệt: Mã ${discount.code}`,
              'discount_promo',
              {
                name: user.name || 'Học viên',
                code: discount.code,
                discountText,
                description: customMessage || discount.description || 'Ưu đãi đặc biệt dành riêng cho bạn khi đăng ký khóa học mới tại trung tâm.',
                validTo: validToFormatted
              }
            );
            successCount += 1;
          }
        } catch (err) {
          logger.error(`Failed to send discount email to ${user.email}: ${err.message}`);
          failCount += 1;
        }
      })
    );

    logger.info(`Admin sent discount code ${discount.code} email to ${successCount} users (${failCount} failed)`);

    res.status(200).json({
      success: true,
      message: `Đã gửi email thành công cho ${successCount} học viên${failCount > 0 ? ` (${failCount} lỗi)` : ''}`,
      data: { successCount, failCount }
    });
  } catch (error) {
    logger.error(`Error in sendDiscountEmail: ${error.message}`);
    res.status(500).json({ success: false, message: 'Lỗi server khi gửi email khuyến mãi' });
  }
};
