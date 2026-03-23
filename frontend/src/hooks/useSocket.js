import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import useMessageStore from '../store/messageStore';

let socketInstance = null;

export const getSocket = () => socketInstance;

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const { addIncomingMessage, setOnlineUsers, setUnreadCount } = useMessageStore();
  const connected = useRef(false);

  const connect = useCallback(() => {
    if (connected.current || !token) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      connected.current = true;
    });

    socketInstance.on('connect_error', () => {
      connected.current = false;
    });

    socketInstance.on('disconnect', () => {
      connected.current = false;
    });

    socketInstance.on('message:receive', (message) => {
      addIncomingMessage(message);
    });

    socketInstance.on('users:online', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socketInstance.on('user:online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socketInstance.on('user:offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socketInstance.on('unread:update', ({ count }) => {
      setUnreadCount(count);
    });
  }, [token, addIncomingMessage, setOnlineUsers, setUnreadCount]);

  const disconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      connected.current = false;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      disconnect();
    }
    return () => { /* keep socket alive across re-renders */ };
  }, [isAuthenticated, token, connect, disconnect]);

  const sendMessage = useCallback((receiverId, content, tempId) => {
    if (!socketInstance?.connected) return false;
    socketInstance.emit('message:send', { receiverId, content, tempId });
    return true;
  }, []);

  const markRead = useCallback((conversationId) => {
    if (!socketInstance?.connected) return;
    socketInstance.emit('messages:read', { conversationId });
  }, []);

  return { sendMessage, markRead, socket: socketInstance };
}
