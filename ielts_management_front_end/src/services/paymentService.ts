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

  /**
   * Lấy lịch sử giao dịch toàn hệ thống (Admin)
   */
  async getAdminPayments(params?: { page?: number; limit?: number; status?: string; courseId?: string; search?: string }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.courseId) queryParams.append('courseId', params.courseId);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return apiClient.get(`/api/payments/admin/all${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Lấy thống kê doanh thu chi tiết (Admin)
   */
  async getAdminRevenueStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/payments/admin/revenue-stats');
  }
}

export const paymentService = new PaymentService();
