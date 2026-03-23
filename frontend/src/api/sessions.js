import api from './axios';
export const requestSessionApi = (data) => api.post('/sessions', data);
export const getStudentSessionsApi = (params) => api.get('/sessions/my', { params });
export const updateSessionStatusApi = (id, data) => api.put(`/sessions/${id}/status`, data);
export const rateSessionApi = (id, data) => api.post(`/sessions/${id}/rate`, data);
