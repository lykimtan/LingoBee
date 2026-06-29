const axios = require('axios');

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  (error) => {
    const responseData = error.response?.data;
    console.error('[API Response Error]', {
      status: error.response?.status,
      message: error.response?.statusText,
      data: responseData,
      details:
        typeof responseData === 'object' && responseData !== null
          ? JSON.stringify(responseData, null, 2)
          : undefined,
    });
    return Promise.reject(error);
  }
);

// Google OAuth verification
const verifyGoogleToken = async (token) => {
  try {
    const response = await apiClient.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    return response.data;
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};

// Google OAuth token exchange
const exchangeGoogleCode = async (code, clientId, clientSecret, redirectUri) => {
  try {
    const response = await apiClient.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to exchange Google code');
  }
};

// Google userinfo profile
const fetchGoogleUserInfo = async (accessToken) => {
  try {
    const response = await apiClient.get('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch Google user info');
  }
};

// Payment Gateway API (Example: Momo, Stripe, etc.)
const createPaymentTransaction = async (paymentData) => {
  try {
    const response = await apiClient.post(
      process.env.PAYMENT_API_URL,
      {
        amount: paymentData.amount,
        currency: 'VND',
        description: paymentData.description,
        customer_email: paymentData.customerEmail,
        customer_phone: paymentData.customerPhone,
        metadata: {
          studentId: paymentData.studentId,
          courseId: paymentData.courseId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Payment transaction failed');
  }
};

// Verify payment transaction
const verifyPaymentTransaction = async (transactionId) => {
  try {
    const response = await apiClient.get(`${process.env.PAYMENT_API_URL}/verify/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYMENT_API_KEY}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to verify payment');
  }
};

const buildEmailContent = (template, variables = {}) => {
  switch (template) {
    case 'email_verification': {
      const name = variables.name || 'there';
      const verificationUrl = variables.verificationUrl || process.env.FRONTEND_URL || '';
      return {
        text: `Xin chào ${name}, vui lòng xác minh email của bạn bằng cách mở liên kết này: ${verificationUrl}`,
        html: `
          <p>Xin chào ${name},</p>
          <p>Vui lòng xác minh email của bạn bằng cách nhấn vào liên kết dưới đây:</p>
          <p><a href="${verificationUrl}">Xác minh email của tôi</a></p>
          <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
        `,
      };
    }
    case 'password_reset': {
      const name = variables.name || 'there';
      const resetUrl = variables.resetUrl || process.env.FRONTEND_URL || '';
      return {
        text: `Xin chào ${name}, vui lòng đặt lại mật khẩu của bạn bằng cách mở liên kết này: ${resetUrl}`,
        html: `
          <p>Xin chào ${name},</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để tiếp tục:</p>
          <p><a href="${resetUrl}">Đặt lại mật khẩu</a></p>
          <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        `,
      };
    }
    case 'welcome_newbie': {
      const name = variables.name || 'bạn';
      const code = variables.code || 'NEWBIE10';
      return {
        text: `Chào mừng ${name} đến với hệ thống! Tặng bạn mã giảm giá ${code} giảm 10% học phí, có giá trị trong 14 ngày.`,
        html: `
          <h3> Chúc mừng ${name} đã xác thực tài khoản thành công!</h3>
          <p>Cảm ơn bạn đã tham gia cùng chúng tôi. Để chào mừng thành viên mới, hệ thống xin dành tặng riêng cho bạn một món quà đặc biệt:</p>
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; color: #4b5563;">Mã giảm giá của bạn</p>
            <h2 style="margin: 8px 0; color: #1c7c78; font-size: 24px; letter-spacing: 2px;">${code}</h2>
            <p style="margin: 0; font-size: 12px; color: #ef4444;">Giảm ngay 10% học phí khóa học bất kỳ!</p>
          </div>
          <p><strong>Lưu ý:</strong> Mã này chỉ có giá trị trong vòng <strong>14 ngày</strong> kể từ hôm nay và chỉ áp dụng 1 lần duy nhất cho tài khoản của bạn.</p>
          <p>Hãy nhanh tay chọn cho mình một khóa học phù hợp và bắt đầu hành trình chinh phục IELTS nhé!</p>
        `,
      };
    }
    case 'teacher_upgrade': {
      const name = variables.name || 'bạn';
      const actionUrl = variables.actionUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/teacher`;
      return {
        text: `Chúc mừng ${name}, tài khoản của bạn đã được nâng cấp thành Giảng viên chính thức tại Trung tâm! Vui lòng truy cập Teacher Dashboard: ${actionUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #1c7c78;">🎓 Chúc mừng bạn đã trở thành Giảng viên!</h2>
            <p>Xin chào <strong>${name}</strong>,</p>
            <p>Ban quản trị hệ thống vừa chính thức thăng cấp tài khoản học viên của bạn thành <strong>Giảng viên (Teacher)</strong>.</p>
            <p>Từ bây giờ, bạn có quyền truy cập vào Cổng Giảng viên để tạo khóa học mới, biên soạn bài giảng và quản lý ngân hàng đề thi kiểm tra năng lực.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" style="display:inline-block;padding:12px 24px;background-color:#1c7c78;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;font-size:16px;">Truy cập Cổng Giảng viên</a>
            </div>
            <p style="color: #666; font-size: 13px;">Trân trọng,<br>Trung tâm Anh ngữ IELTS LingoBee</p>
          </div>
        `,
      };
    }
    case 'course_invitation': {
      const name = variables.name || 'bạn';
      const courseName = variables.courseName || 'Khóa học';
      const senderName = variables.senderName || 'Một giáo viên';
      const actionUrl = variables.actionUrl || process.env.FRONTEND_URL || '';
      return {
        text: `Xin chào ${name}, ${senderName} đã mời bạn làm trợ giảng cho khóa học ${courseName}. Vui lòng đăng nhập và kiểm tra lời mời tại: ${actionUrl}`,
        html: `
          <h3>Xin chào ${name},</h3>
          <p><strong>${senderName}</strong> vừa gửi cho bạn một lời mời làm trợ giảng cho khóa học <strong>${courseName}</strong>.</p>
          <p>Để xem chi tiết và phản hồi lời mời, vui lòng đăng nhập vào hệ thống và kiểm tra thông báo của bạn hoặc nhấn vào liên kết dưới đây:</p>
          <p><a href="${actionUrl}" style="display:inline-block;padding:10px 20px;background-color:#1c7c78;color:#fff;text-decoration:none;border-radius:4px;">Xem lời mời</a></p>
          <p>Nếu bạn có thắc mắc, vui lòng liên hệ lại với giáo viên chính của khóa học.</p>
        `,
      };
    }
    case 'discount_promo': {
      const name = variables.name || 'Học viên';
      const code = variables.code || 'CODE';
      const discountText = variables.discountText || 'Ưu đãi học phí';
      const description = variables.description || 'Ưu đãi đặc biệt dành riêng cho bạn.';
      const validTo = variables.validTo || '';
      const actionUrl = variables.actionUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses`;
      return {
        text: `Xin chào ${name}, tặng bạn mã ưu đãi ${code} (${discountText}). ${description}. Hạn dùng: ${validTo}. Truy cập ngay: ${actionUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #0f766e; margin: 0; font-size: 24px;">🎁 Quà Tặng Ưu Đãi Đặc Biệt!</h2>
            </div>
            <p style="color: #334155; font-size: 15px;">Xin chào <strong>${name}</strong>,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">Trung tâm xin gửi tặng riêng bạn mã khuyến mãi học phí để đồng hành cùng bạn trên chặng đường chinh phục IELTS:</p>
            <div style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); padding: 24px; text-align: center; border-radius: 12px; margin: 24px 0; color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <p style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Mã khuyến mãi của bạn</p>
              <h1 style="margin: 10px 0; font-size: 32px; font-family: monospace; letter-spacing: 3px; color: #facc15; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${code}</h1>
              <div style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 4px;">
                ${discountText}
              </div>
              ${description ? `<p style="margin: 12px 0 0 0; font-size: 13px; opacity: 0.9;">${description}</p>` : ''}
              ${validTo ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #fef08a;">⏰ Hạn sử dụng: <strong>${validTo}</strong></p>` : ''}
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${actionUrl}" style="display:inline-block;padding:14px 28px;background-color:#0f766e;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:bold;font-size:16px;box-shadow: 0 4px 6px -1px rgba(15, 118, 110, 0.3);">Chọn Khóa Học Ngay</a>
            </div>
            <p style="color: #64748b; font-size: 13px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">Trân trọng,<br><strong>Hệ thống Đào tạo IELTS LingoBee</strong></p>
          </div>
        `
      };
    }
    default:
      return {
        text: variables.message || 'Bạn có một thông báo mới.',
        html: `<p>${variables.message || 'Bạn có một thông báo mới.'}</p>`,
      };
  }
};

// Send Email via Email Service (Resend or SendGrid)
const sendEmail = async (email, subject, template, variables) => {
  try {
    const senderEmail = process.env.SENDER_EMAIL || 'LingoBee IELTS <onboarding@resend.dev>';
    const emailServiceUrl =
      process.env.EMAIL_SERVICE_URL || 'https://api.resend.com/emails';
    const { text, html } = buildEmailContent(template, variables);

    const apiKey = process.env.EMAIL_SERVICE_KEY || '';
    const isResend = emailServiceUrl.includes('resend') || apiKey.startsWith('re_');

    const payload = isResend
      ? {
          from: senderEmail,
          to: [email],
          subject: subject,
          html: html,
          text: text,
        }
      : {
          personalizations: [
            {
              to: [{ email }],
              subject,
            },
          ],
          from: {
            email: senderEmail,
          },
          content: [
            {
              type: 'text/plain',
              value: text,
            },
            {
              type: 'text/html',
              value: html,
            },
          ],
        };

    const response = await apiClient.post(emailServiceUrl, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data || { status: response.status };
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error('Failed to send email:', errorDetails);
    throw error;
  }
};

// Send SMS (Optional)
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!process.env.SMS_SERVICE_KEY) {
      console.warn('SMS service not configured');
      return null;
    }

    const response = await apiClient.post(
      process.env.SMS_SERVICE_URL,
      {
        phone: phoneNumber,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SMS_SERVICE_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to send SMS:', error.message);
    throw error;
  }
};

module.exports = {
  apiClient,
  verifyGoogleToken,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  createPaymentTransaction,
  verifyPaymentTransaction,
  sendEmail,
  sendSMS,
};
