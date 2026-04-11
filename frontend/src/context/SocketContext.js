/**
 * Socket Context
 * Real-time WebSocket connection via Socket.IO
 * Fixed: connects ONCE, never reconnects unless userId actually changes
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveNotification, setLiveNotification] = useState(null);

  // Use stable primitive values — not the full user object
  const userId = user?._id || null;
  const userRole = user?.role || null;

  useEffect(() => {
    // No user — disconnect if connected
    if (!userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Already connected with same user — do nothing
    if (socketRef.current?.connected) return;

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],   // websocket only — no polling fallback to reduce noise
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join', userId);
      if (userRole === 'admin') socket.emit('join_admin');
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('credits_updated', (data) => {
      setLiveNotification({
        type: data.change > 0 ? 'success' : 'warning',
        title: data.notification?.title || 'Credits Updated',
        message: data.notification?.message || `Your credits: ${data.credits}`,
        credits: data.credits,
        timestamp: Date.now()
      });
      window.dispatchEvent(new CustomEvent('credits:updated', { detail: data }));
    });

    socket.on('transaction_created', (data) => {
      window.dispatchEvent(new CustomEvent('transaction:created', { detail: data }));
    });

    socket.on('broadcast_notification', (data) => {
      setLiveNotification({ type: 'info', ...data, timestamp: Date.now() });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, userRole]); // only re-run if the actual user ID or role changes

  const clearLiveNotification = () => setLiveNotification(null);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      liveNotification,
      clearLiveNotification
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

