import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if we have a token
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.USER_TOKEN) : null;
    
    if (!token) return;

    if (!socketRef.current) {
      socketRef.current = io(API_BASE_URL, {
        auth: {
          token
        },
        reconnection: true,
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected:', socketRef.current?.id);
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return { socket: socketRef.current, isConnected };
};
