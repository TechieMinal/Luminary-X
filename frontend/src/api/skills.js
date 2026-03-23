import api from './axios';
export const getMySkillsApi = () => api.get('/skills/my');
export const getUserSkillsApi = (userId) => api.get(`/skills/user/${userId}`);
export const addSkillApi = (data) => api.post('/skills', data);
export const updateSkillApi = (id, data) => api.put(`/skills/${id}`, data);
export const deleteSkillApi = (id) => api.delete(`/skills/${id}`);
export const endorseSkillApi = (id) => api.post(`/skills/${id}/endorse`);
