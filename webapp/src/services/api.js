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

// Onboarding
export const getOnboardingStatus = () => api.get('/onboarding/status');
export const getOnboardingOptions = () => api.get('/onboarding/options');
export const saveOnboardingStep = (step, data) => api.post(`/onboarding/step/${step}`, data);
export const completeOnboarding = () => api.post('/onboarding/complete');
export const skipOnboarding = () => api.post('/onboarding/skip');
export const getOnboardingSuggestions = () => api.get('/onboarding/suggestions');

// Verification
export const uploadVerificationDocument = (formData) => api.post('/verification/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getVerificationDocuments = () => api.get('/verification/documents');
export const deleteVerificationDocument = (id) => api.delete(`/verification/documents/${id}`);
export const getVerificationStatus = () => api.get('/verification/status');
export const getDocumentRequirements = () => api.get('/verification/requirements');

// Matching
export const getMatches = (params) => api.get('/matching', { params });
export const performMatchAction = (matchedUserId, action) => api.post(`/matching/${matchedUserId}/action`, { action });
export const getConnections = () => api.get('/matching/connections');
export const getMatchingPreferences = () => api.get('/matching/preferences');
export const updateMatchingPreferences = (data) => api.put('/matching/preferences', data);
export const blockUser = (blockedUserId) => api.post(`/matching/${blockedUserId}/block`);

// Activities
export const getActivities = (params) => api.get('/activities', { params });
export const createActivity = (data) => api.post('/activities', data);
export const getActivity = (id) => api.get(`/activities/${id}`);
export const updateActivity = (id, data) => api.put(`/activities/${id}`, data);
export const cancelActivity = (id) => api.delete(`/activities/${id}`);
export const rsvpActivity = (id, message) => api.post(`/activities/${id}/rsvp`, { message });
export const cancelRsvp = (id) => api.delete(`/activities/${id}/rsvp`);
export const getActivityChat = (id, params) => api.get(`/activities/${id}/chat`, { params });
export const sendActivityMessage = (id, content, type = 'TEXT') => api.post(`/activities/${id}/chat`, { content, type });
export const getMyActivities = (type) => api.get('/activities/mine', { params: { type } });

// Subscription
export const getSubscriptionPlans = () => api.get('/subscription/plans');
export const getMySubscription = () => api.get('/subscription');
export const createCheckoutSession = (data) => api.post('/subscription/checkout', data);
export const createBillingPortal = (data) => api.post('/subscription/portal', data);
export const cancelSubscription = (reason) => api.post('/subscription/cancel', { reason });
export const resumeSubscription = () => api.post('/subscription/resume');
export const checkFeatureAccess = (feature) => api.get(`/subscription/feature/${feature}`);

// Chat
export const getChatConversations = () => api.get('/chat/conversations');
export const startPrivateChat = (userId) => api.post(`/chat/private/${userId}`);
export const getChatMessages = (conversationId, params) => api.get(`/chat/${conversationId}/messages`, { params });
export const sendChatMessage = (conversationId, content, type = 'TEXT') => api.post(`/chat/${conversationId}/messages`, { content, type });
export const markChatRead = (conversationId) => api.post(`/chat/${conversationId}/read`);
export const getCityRooms = (country) => api.get('/chat/rooms/cities', { params: { country } });
export const getCountryRooms = () => api.get('/chat/rooms/countries');
export const joinCityRoom = (city, country) => api.post('/chat/rooms/city', { city, country });
export const joinCountryRoom = (country) => api.post('/chat/rooms/country', { country });
export const leaveRoom = (conversationId) => api.delete(`/chat/rooms/${conversationId}/leave`);
export const reportMessage = (messageId, reason, details) => api.post(`/chat/messages/${messageId}/report`, { reason, details });

// Map
export const getMapPins = (bounds, types) => api.get('/map/pins', { params: { ...bounds, types: types?.join(',') } });
export const getMapRoute = (start, end, profile) => api.get('/map/route', { params: { startLat: start.lat, startLng: start.lng, endLat: end.lat, endLng: end.lng, profile } });
export const getHeatmapData = (type, bounds) => api.get(`/map/heatmap/${type}`, { params: bounds });
export const updateLocation = (latitude, longitude, city, country) => api.post('/map/location', { latitude, longitude, city, country });
export const searchNearby = (lat, lng, radius, types) => api.get('/map/nearby', { params: { lat, lng, radius, types: types?.join(',') } });

// Reviews (enhanced)
export const getExperienceReviews = (experienceId, params) => api.get(`/reviews/experience/${experienceId}`, { params });
export const getExperienceReviewStats = (experienceId) => api.get(`/reviews/experience/${experienceId}/stats`);
export const createExperienceReview = (experienceId, data) => api.post(`/reviews/experience/${experienceId}`, data);
export const markReviewHelpful = (reviewId, isHelpful) => api.post(`/reviews/${reviewId}/helpful`, { isHelpful });
export const addGuideResponse = (reviewId, content) => api.post(`/reviews/${reviewId}/response`, { content });
export const reportReview = (reviewId, reason, details) => api.post(`/reviews/${reviewId}/report`, { reason, details });
export const getUserReviews = (userId, params) => api.get(`/reviews/user/${userId}`, { params });
export const getUserBadges = (userId) => api.get(`/reviews/user/${userId}/badges`);
export const createUserReview = (userId, data) => api.post(`/reviews/user/${userId}`, data);

export default api;
