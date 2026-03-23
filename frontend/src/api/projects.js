import api from './axios';
export const getProjectsApi = (params) => api.get('/projects', { params });
export const getMyProjectsApi = (params) => api.get('/projects/my', { params });
export const getProjectByIdApi = (id) => api.get(`/projects/${id}`);
export const createProjectApi = (data) => api.post('/projects', data);
export const updateProjectApi = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProjectApi = (id) => api.delete(`/projects/${id}`);
export const toggleLikeApi = (id) => api.post(`/projects/${id}/like`);
