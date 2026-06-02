const mongoose = require('mongoose');
require('dotenv').config();
const DiscountCode = require('./src/models/DiscountCode');

async function seedNewbieDiscount() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const code = await DiscountCode.findOneAndUpdate(
      { code: 'NEWBIE10' },
      {
        description: 'Giảm 10% cho học viên mới trong 14 ngày đầu',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: null, 
        maxUsageTotal: -1, 
        maxUsagePerStudent: 1,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000), // Valid for 10 years (logic limits it to 14 days)
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log('Discount code seeded successfully:', code.code);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding discount:', error);
    process.exit(1);
  }
}

seedNewbieDiscount();
