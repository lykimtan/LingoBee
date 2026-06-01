import { DefaultChatTransport } from 'ai';
import { API_BASE_URL } from '@/constants';

export const getChatTransport = () => {
  return new DefaultChatTransport({
    api: `${API_BASE_URL}/api/chat`
  });
};
