import { DefaultChatTransport } from 'ai';
import { API_BASE_URL } from '@/constants';

export const getChatTransport = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.USER_TOKEN) : null;
  return new DefaultChatTransport({
    api: `${API_BASE_URL}/api/chat`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
};

import { STORAGE_KEYS } from '@/constants';

export const getTutorChatTransport = (context?: any) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.USER_TOKEN) : null;
  return new DefaultChatTransport({
    api: `${API_BASE_URL}/api/learning/explain`,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: context ? { context } : undefined
  });
};
