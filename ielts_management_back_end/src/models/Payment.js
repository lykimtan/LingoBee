const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    priceTier: {
      name: {
        type: String,
        required: true,
      },
      basePrice: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    discountCode: {
      code: {
        type: String,
        default: null,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
      percentage: {
        type: Number,
        default: 0, // If percentage discount
      },
      appliedDate: {
        type: Date,
        default: null,
      },
      codeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DiscountCode',
        default: null,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: null, // From payment gateway
    },
    txnRef: {
      type: String,
      unique: true,
      sparse: true, // Mã duy nhất gửi sang VNPay làm vnp_TxnRef
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'momo', 'bank_transfer', 'vnpay'],
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    enrollmentDate: {
      type: Date,
      default: null, // When student officially enrolled
    },
    vnpayData: {
      vnp_TransactionNo: String, // Mã giao dịch ghi nhận tại hệ thống VNPay
      vnp_BankCode: String,      // Mã ngân hàng (vd: NCB, VCB...)
      vnp_BankTranNo: String,    // Mã giao dịch tại ngân hàng
      vnp_CardType: String,      // Loại thẻ (ATM, QRCODE, VISA...)
      vnp_PayDate: String,       // Thời gian thanh toán do VNPay trả về
      vnp_ResponseCode: String,  // Mã phản hồi (00 là thành công)
      vnp_OrderInfo: String,     // Thông tin đơn hàng
    },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ studentId: 1, courseId: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ enrollmentDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
