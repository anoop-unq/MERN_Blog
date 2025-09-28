import axios from 'axios';

// Configure axios to send cookies with every request
const api = axios.create({
  baseURL: import.meta.REACT_APP_API_URL || 'http://localhost:3800',
  withCredentials: true,
});

export const guestAPI = {
  create: (data) => api.post('/api/guest/create', data),
  getDetails: () => api.get('/api/guest/details'),
  logout: () => api.post('/api/guest/logout'),
  checkUsername: (username) => api.get(`/api/guest/check-username?username=${username}`),
   findByUsername: (data) => api.post(`/api/guest/find-by-username`, data, { withCredentials: true }),
};

export default api;

