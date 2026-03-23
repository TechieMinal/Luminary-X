import { create } from 'zustand';
import { getMeApi, loginApi, registerApi } from '../api/auth';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('lx_token') || null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    const res = await loginApi(credentials);
    const { token, user } = res.data.data;
    localStorage.setItem('lx_token', token);
    set({ token, user, isAuthenticated: true });
    return user;
  },

  register: async (data) => {
    const res = await registerApi(data);
    const payload = res.data.data;

    // Mentors get requiresApproval:true — no token issued
    if (payload.requiresApproval) {
      return { requiresApproval: true };
    }

    const { token, user } = payload;
    localStorage.setItem('lx_token', token);
    set({ token, user, isAuthenticated: true });
    return user;
  },

  logout: () => {
    localStorage.removeItem('lx_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    const token = localStorage.getItem('lx_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const res = await getMeApi();
      set({ user: res.data.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('lx_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),
}));

export default useAuthStore;
