import { apiClient } from "@/utils/api";
import {
	TeacherInvitation,
} from "@/types";
class InvatationService {
    async getInvitations() {
    return apiClient.get<TeacherInvitation[]>("/api/courses/invitations");
  }

  async respondToInvitation(id: string, action: "accept" | "reject") {
    return apiClient.post(`/api/courses/invitations/${id}/${action}`);
  }

  async inviteAssistant(courseId: string, data: { teacherId: string, message?: string }) {
    return apiClient.post(`/api/courses/${courseId}/assistants/invite`, data);
  }
}

export const invitationService = new InvatationService();