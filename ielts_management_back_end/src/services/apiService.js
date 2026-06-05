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
    default:
      return {
        text: variables.message || 'Bạn có một thông báo mới.',
        html: `<p>${variables.message || 'Bạn có một thông báo mới.'}</p>`,
      };
  }
};

// Send Email via SendGrid API
const sendEmail = async (email, subject, template, variables) => {
  try {
    const senderEmail = process.env.SENDER_EMAIL || 'noreply@example.com';
    const emailServiceUrl =
      process.env.EMAIL_SERVICE_URL || 'https://api.sendgrid.com/v3/mail/send';
    const { text, html } = buildEmailContent(template, variables);

    const response = await apiClient.post(
      emailServiceUrl,
      {
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
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.EMAIL_SERVICE_KEY}`,
        },
      }
    );
    return response.data || { status: response.status };
  } catch (error) {
    const sendGridErrors = error.response?.data?.errors;
    console.error('Failed to send email:', error.message, sendGridErrors || '');
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
