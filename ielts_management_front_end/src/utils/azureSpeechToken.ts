import { apiClient } from './api';

let cachedToken: string | null = null;
let cachedRegion: string | null = null;
let tokenExpirationTime: number | null = null;

export const getSpeechToken = async (): Promise<{ token: string, region: string }> => {
  const now = new Date().getTime();

  // If token exists and is valid (give a 1 minute buffer for 10-min tokens)
  if (cachedToken && cachedRegion && tokenExpirationTime && now < tokenExpirationTime - 60000) {
    return { token: cachedToken, region: cachedRegion };
  }

  try {
    const response = await apiClient.get<{ token: string; region: string }>('/api/learning/azure-speech-token');
    
    if (response.success && response.data) {
      cachedToken = response.data.token;
      cachedRegion = response.data.region;
      tokenExpirationTime = now + 9 * 60 * 1000; // Cache for 9 minutes
      
      return { token: cachedToken, region: cachedRegion };
    } else {
      throw new Error(response.message || 'Failed to get token');
    }
  } catch (error) {
    console.error('Error fetching Azure Speech token:', error);
    throw error;
  }
};
