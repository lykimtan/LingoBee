import { apiClient } from '@/utils/api';
import { ApiResponse } from '@/types';

export interface DiscountCode {
  _id: string;
  code: string;
  description: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  maxDiscountAmount?: number | null;
  maxUsageTotal: number;
  maxUsagePerStudent: number;
  usageCount: number;
  validFrom: string;
  validTo: string;
  applicableCourses: Array<{ _id: string; title: string; slug?: string }> | [];
  isActive: boolean;
  createdAt: string;
}

export interface DiscountListResponse {
  data: DiscountCode[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class DiscountService {
  /**
   * Lấy danh sách mã khuyến mãi (Admin)
   */
  async getDiscounts(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<ApiResponse<DiscountListResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `/api/discounts${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<DiscountListResponse>(url);
  }

  /**
   * Tạo mã khuyến mãi mới
   */
  async createDiscount(data: Partial<DiscountCode>): Promise<ApiResponse<DiscountCode>> {
    return apiClient.post<DiscountCode>('/api/discounts', data);
  }

  /**
   * Cập nhật mã khuyến mãi
   */
  async updateDiscount(id: string, data: Partial<DiscountCode>): Promise<ApiResponse<DiscountCode>> {
    return apiClient.put<DiscountCode>(`/api/discounts/${id}`, data);
  }

  /**
   * Bật/Tắt trạng thái kích hoạt
   */
  async toggleStatus(id: string): Promise<ApiResponse<DiscountCode>> {
    return apiClient.patch<DiscountCode>(`/api/discounts/${id}/toggle-status`, {});
  }

  /**
   * Xóa mã khuyến mãi
   */
  async deleteDiscount(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/api/discounts/${id}`);
  }

  /**
   * Lấy thống kê tỷ lệ sử dụng mã ưu đãi
   */
  async getDiscountStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/api/discounts/stats');
  }

  /**
   * Gửi email mã khuyến mãi cho học viên qua SendGrid
   */
  async sendDiscountEmail(id: string, userIds: string[], customMessage?: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/api/discounts/${id}/send-email`, { userIds, customMessage });
  }
}

export const discountService = new DiscountService();
