/**
 * Auth Context
 * Global authentication state management
 * Fixed: no duplicate /me calls, stable references, no re-render loops
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize user directly from localStorage — no useEffect needed
    try {
      const saved = localStorage.getItem('ecycle_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [token] = useState(() => localStorage.getItem('ecycle_token'));
  const initDone = useRef(false); // prevent double-run in StrictMode

  // Validate token ONCE on mount — no dependencies, runs exactly one time
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    if (!token) {
      setLoading(false);
      return;
    }

    authApi.me()
      .then(({ user: fresh }) => {
        setUser(fresh);
        localStorage.setItem('ecycle_user', JSON.stringify(fresh));
      })
      .catch(() => {
        // Token invalid — clear everything
        localStorage.removeItem('ecycle_token');
        localStorage.removeItem('ecycle_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for forced logout from axios interceptor
  useEffect(() => {
    const handle = () => {
      localStorage.removeItem('ecycle_token');
      localStorage.removeItem('ecycle_user');
      setUser(null);
    };
    window.addEventListener('auth:logout', handle);
    return () => window.removeEventListener('auth:logout', handle);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('ecycle_token', data.token);
    localStorage.setItem('ecycle_user', JSON.stringify(data.user));
    // Reload page so token state is fresh — cleanest way to avoid stale token ref
    window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await authApi.signup({ name, email, password });
    localStorage.setItem('ecycle_token', data.token);
    localStorage.setItem('ecycle_user', JSON.stringify(data.user));
    window.location.href = '/dashboard';
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ecycle_token');
    localStorage.removeItem('ecycle_user');
    window.location.href = '/';
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('ecycle_user', JSON.stringify(updatedUser));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user: fresh } = await authApi.me();
      setUser(fresh);
      localStorage.setItem('ecycle_user', JSON.stringify(fresh));
      return fresh;
    } catch {}
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isAdmin,
      login, signup, logout, updateUser, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

