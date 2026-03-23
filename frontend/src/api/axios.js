import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lx_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';

    // 401 — expired/invalid token — force re-login
    if (status === 401) {
      localStorage.removeItem('lx_token');
      // Only redirect if not already on an auth page
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 403 — show message but don't redirect (could be pending approval)
    if (status === 403) {
      toast.error(message);
      return Promise.reject(error);
    }

    // 429 — rate limit (only in production)
    if (status === 429) {
      toast.error('Too many requests. Please slow down.');
      return Promise.reject(error);
    }

    // Network error
    if (!error.response) {
      toast.error('Network error. Check your connection.');
      return Promise.reject(error);
    }

    // All other errors
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
