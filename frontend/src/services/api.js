import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  searchUsers: (params) => api.get('/users/search', { params }),
};

// Skills API
export const skillsAPI = {
  getSkills: () => api.get('/skills'),
  addSkill: (skill) => api.post('/skills', skill),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
};

// Swaps API
export const swapsAPI = {
  getSwaps: () => api.get('/swaps'),
  sendSwapRequest: (data) => api.post('/swaps', data),
  updateSwapStatus: (id, status) => api.put(`/swaps/${id}`, { status }),
  deleteSwapRequest: (id) => api.delete(`/swaps/${id}`),
};

// Ratings API
export const ratingsAPI = {
  getUserRatings: (userId) => api.get(`/ratings/user/${userId}`),
  getGivenRatings: (userId) => api.get(`/ratings/given/${userId}`),
  addRating: (rating) => api.post('/ratings', rating),
};

// Upload API
export const uploadAPI = {
  uploadProfileImage: (formData) => api.post('/upload/profile-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Messages API
export const messagesAPI = {
  getMessages: (swapId) => api.get(`/messages/swap/${swapId}`),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (swapId) => api.put(`/messages/read/${swapId}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  banUser: (userId) => api.put(`/admin/users/${userId}/ban`),
  getAllSwaps: () => api.get('/admin/swaps'),
  moderateSkill: (skillId, action) => api.put(`/admin/skills/${skillId}`, { action }),
  sendPlatformMessage: (message) => api.post('/admin/messages', message),
  getReports: () => api.get('/admin/reports'),
};

export default api;