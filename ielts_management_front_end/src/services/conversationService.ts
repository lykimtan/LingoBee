import { apiClient } from '@/utils/api';
import { ApiResponse, Conversation, Message, ChatAttachment } from '@/types';

class ConversationService {
  async getCourseConversations(courseId: string): Promise<ApiResponse<Conversation[]>> {
    return apiClient.get<Conversation[]>(`/api/conversations/course/${courseId}`);
  }

  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    return apiClient.get<Message[]>(`/api/conversations/${conversationId}/messages`);
  }

  async sendMessage(
    conversationId: string, 
    message: string, 
    attachments: ChatAttachment[] = [], 
    replyToMessageId?: string | null
  ): Promise<ApiResponse<Message>> {
    return apiClient.post<Message>(`/api/conversations/${conversationId}/messages`, {
      message,
      attachments,
      replyToMessageId
    });
  }

  async createGroupConversation(courseId: string, groupName: string): Promise<ApiResponse<Conversation>> {
    return apiClient.post<Conversation>(`/api/conversations/courses/${courseId}/groups`, { groupName });
  }

  async createPrivateConversation(courseId: string, targetUserId: string): Promise<ApiResponse<Conversation>> {
    return apiClient.post<Conversation>(`/api/conversations/private`, { courseId, targetUserId });
  }
}

export const conversationService = new ConversationService();
