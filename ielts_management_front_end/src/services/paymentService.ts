import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface CreatePaymentResponse {
  paymentUrl: string;
}

class PaymentService {
  /**
   * Kiểm tra mã giảm giá
   */
  async verifyDiscount(courseId: string, code: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/payments/verify-discount', { courseId, code });
  }

  /**
   * Tạo URL thanh toán VNPay
   */
  async createPaymentUrl(courseId: string, discountCode?: string, priceTierName?: string): Promise<ApiResponse<CreatePaymentResponse>> {
    return apiClient.post<CreatePaymentResponse>('/api/payments/create-payment-url', {
      courseId,
      discountCode,
      priceTierName,
    });
  }
}

export const paymentService = new PaymentService();
