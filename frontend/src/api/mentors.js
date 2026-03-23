import api from './axios';

export const getMentorsApi = (params) => api.get('/mentors', { params });
export const getMentorByIdApi = (id) => api.get(`/mentors/${id}`);
export const getMyProfileApi = () => api.get('/mentors/profile');            // GET /mentors/profile
export const updateMentorProfileApi = (data) => api.put('/mentors/profile', data); // PUT /mentors/profile
export const getMentorMenteesApi = () => api.get('/mentors/profile/mentees'); // GET /mentors/profile/mentees
export const getMentorSessionsApi = (params) => api.get('/mentors/profile/sessions', { params }); // GET /mentors/profile/sessions
