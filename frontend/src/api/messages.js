import api from './axios';
export const getConversationsApi = () => api.get('/messages/conversations');
export const getMessagesApi = (userId, params) => api.get(`/messages/${userId}`, { params });
export const sendMessageApi = (data) => api.post('/messages', data);
export const getUnreadCountApi = () => api.get('/messages/unread');
export const searchUsersApi = (search) => api.get('/messages/users', { params: { search } });
