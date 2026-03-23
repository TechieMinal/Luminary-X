import api from './axios';
export const getDashboardStatsApi = () => api.get('/admin/dashboard');
export const getAllUsersApi = (params) => api.get('/admin/users', { params });
export const getPendingMentorsApi = () => api.get('/admin/pending-mentors');
export const approveUserApi = (id) => api.put(`/admin/users/${id}/approve`);
export const toggleUserStatusApi = (id) => api.put(`/admin/users/${id}/toggle-status`);
export const deleteUserApi = (id) => api.delete(`/admin/users/${id}`);
