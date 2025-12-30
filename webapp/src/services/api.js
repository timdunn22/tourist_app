import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);
export const getProfile = () => api.get('/auth/profile');

// Experiences
export const getExperiences = (params) => api.get('/experiences', { params });
export const getExperience = (id) => api.get(`/experiences/${id}`);
export const createExperience = (data) => api.post('/experiences', data);
export const updateExperience = (id, data) => api.put(`/experiences/${id}`, data);

// Guides
export const getGuides = (params) => api.get('/guides', { params });
export const getGuide = (id) => api.get(`/guides/${id}`);

// Bookings
export const getBookings = () => api.get('/bookings');
export const createBooking = (data) => api.post('/bookings', data);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);

// Reviews
export const getReviews = (experienceId) => api.get(`/experiences/${experienceId}/reviews`);
export const createReview = (experienceId, data) => api.post(`/experiences/${experienceId}/reviews`, data);

// Categories
export const getCategories = () => api.get('/categories');

// Messages
export const getConversations = () => api.get('/messages');
export const getMessages = (conversationId) => api.get(`/messages/${conversationId}`);
export const sendMessage = (conversationId, content) => api.post(`/messages/${conversationId}`, { content });

// Favorites
export const getFavorites = () => api.get('/favorites');
export const addFavorite = (experienceId) => api.post('/favorites', { experienceId });
export const removeFavorite = (experienceId) => api.delete(`/favorites/${experienceId}`);

export default api;
