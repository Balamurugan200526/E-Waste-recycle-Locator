/**
 * Axios API Client
 * Centralized HTTP requests with JWT auth
 */

import axios from 'axios';

// ── Base URL (PRODUCTION + DEVELOPMENT FIX) ───────────────
const API_BASE =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://e-waste-recycle-locator.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT token ────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecycle_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle errors globally ─────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('ecycle_token');
      localStorage.removeItem('ecycle_user');
      window.dispatchEvent(new Event('auth:logout'));
    }

    const message =
      error.response?.data?.error ||
      error.message ||
      'Network error';

    return Promise.reject(new Error(message));
  }
);

// ── Auth API ─────────────────────────────────────────────
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// ── Centers API ──────────────────────────────────────────
export const centersApi = {
  getAll: () => api.get('/centers'),
  getNearby: (lat, lng, radius = 50) =>
    api.get('/centers/nearby', { params: { lat, lng, radius } }),
  getById: (id) => api.get(`/centers/${id}`),
  create: (data) => api.post('/centers', data),
  update: (id, data) => api.put(`/centers/${id}`, data),
  delete: (id) => api.delete(`/centers/${id}`),
};

// ── Recycle API ──────────────────────────────────────────
export const recycleApi = {
  submit: (data) => api.post('/recycle/submit', data),
  verify: (token) => api.post('/recycle/verify', { token }),
  verifyScan: (token, codeword) =>
    api.post('/recycle/verify-scan', { token, codeword }),
  getScanPreview: (token) => api.get(`/recycle/scan/${token}`),
  myTransactions: (page = 1) =>
    api.get('/recycle/my', { params: { page } }),
  leaderboard: () => api.get('/recycle/leaderboard'),
  getById: (id) => api.get(`/recycle/${id}`),
};

// ── Admin API ────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get('/admin/stats'),
  users: (page = 1, search = '') =>
    api.get('/admin/users', { params: { page, search } }),
  updateCredits: (userId, amount, action, reason) =>
    api.patch(`/admin/users/${userId}/credits`, { amount, action, reason }),
  toggleUserStatus: (userId) =>
    api.patch(`/admin/users/${userId}/status`),
  transactions: (page = 1) =>
    api.get('/admin/transactions', { params: { page } }),
  broadcast: (title, message) =>
    api.post('/admin/broadcast', { title, message }),
};

// ── Rewards API ──────────────────────────────────────────
export const rewardsApi = {
  getAll: (category) =>
    api.get('/rewards', {
      params: category && category !== 'All' ? { category } : {},
    }),
  redeem: (rewardId) =>
    api.post('/rewards/redeem', { rewardId }),
  myRedemptions: () => api.get('/rewards/my'),

  // Admin
  adminAll: () => api.get('/rewards/admin/all'),
  create: (data) => api.post('/rewards/admin/create', data),
  toggle: (id) => api.patch(`/rewards/admin/${id}/toggle`),
  addCodes: (id, codes) =>
    api.post(`/rewards/admin/${id}/add-codes`, { codes }),
  delete: (id) => api.delete(`/rewards/admin/${id}`),
};

// ── Notifications API ─────────────────────────────────────
export const notificationsApi = {
  getAll: (page = 1) =>
    api.get('/notifications', { params: { page } }),
  markRead: (id) =>
    api.patch(`/notifications/${id}/read`),
  markAllRead: () =>
    api.patch('/notifications/read-all'),
};

export default api;