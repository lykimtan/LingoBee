import { apiClient } from "@/utils/api";
import {
     NotificationItem, 
} from "@/types";
class NotificationService {

    async getNotifications(limit: number = 200) {
        const encodedLimit = encodeURIComponent(limit);
        return apiClient.get<NotificationItem[]>(
        `/api/notifications?limit=${encodedLimit}`
        );
  }

  async markAllAsRead() {
    const response = await apiClient.post("/api/notifications/read-all");
    return response;
  }

  async getUnreadNotifications(limit: number = 50) {
    const encodedLimit = encodeURIComponent(limit);
    return apiClient.get<NotificationItem[]>(
        `/api/notifications?isRead=false&limit=${encodedLimit}`
    );
}

}

export const notificationService = new NotificationService();