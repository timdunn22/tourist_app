import { Router } from 'express';
import { body, query } from 'express-validator';
import * as adminController from '../controllers/adminController';
import { validateRequest } from '../middleware/validateRequest';
import { requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require ADMIN or SUPER_ADMIN role
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

// ==================== DASHBOARD ====================

router.get('/dashboard', adminController.getDashboard);
router.get('/analytics', adminController.getAnalytics);
router.get('/recent-activity', adminController.getRecentActivity);

// ==================== USERS ====================

router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// ==================== GUIDES ====================

router.get('/guides', adminController.getGuides);
router.get('/guides/:id', adminController.getGuide);
router.put('/guides/:id', adminController.updateGuide);
router.put('/guides/:id/verify', adminController.verifyGuide);
router.put('/guides/:id/level', adminController.updateGuideLevel);

// ==================== EXPERIENCES ====================

router.get('/experiences', adminController.getExperiences);
router.get('/experiences/:id', adminController.getExperience);
router.put('/experiences/:id', adminController.updateExperience);
router.put('/experiences/:id/status', adminController.updateExperienceStatus);
router.put('/experiences/:id/featured', adminController.toggleFeatured);
router.delete('/experiences/:id', adminController.deleteExperience);

// ==================== BOOKINGS ====================

router.get('/bookings', adminController.getBookings);
router.get('/bookings/:id', adminController.getBooking);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.post('/bookings/:id/refund', adminController.refundBooking);

// ==================== REVIEWS ====================

router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id/status', adminController.updateReviewStatus);
router.delete('/reviews/:id', adminController.deleteReview);

// ==================== CATEGORIES ====================

router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ==================== STAYS ====================

router.get('/stays', adminController.getStays);
router.get('/stays/:id', adminController.getStay);
router.put('/stays/:id', adminController.updateStay);
router.put('/stays/:id/status', adminController.updateStayStatus);

// ==================== SERVICES ====================

router.get('/services', adminController.getServices);
router.post('/services', adminController.createService);
router.put('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// ==================== TRAINING ====================

router.get('/training', adminController.getTrainingModules);
router.post('/training', adminController.createTrainingModule);
router.put('/training/:id', adminController.updateTrainingModule);
router.delete('/training/:id', adminController.deleteTrainingModule);

// ==================== LOCATIONS ====================

router.get('/locations', adminController.getLocations);
router.post('/locations', adminController.createLocation);
router.put('/locations/:id', adminController.updateLocation);
router.delete('/locations/:id', adminController.deleteLocation);

// ==================== SETTINGS ====================

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.get('/settings/:key', adminController.getSetting);
router.put('/settings/:key', adminController.updateSetting);

// ==================== SUPPORT ====================

router.get('/tickets', adminController.getTickets);
router.get('/tickets/:id', adminController.getTicket);
router.put('/tickets/:id', adminController.updateTicket);
router.post('/tickets/:id/reply', adminController.replyToTicket);

// ==================== REPORTS ====================

router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/bookings', adminController.getBookingsReport);
router.get('/reports/users', adminController.getUsersReport);
router.get('/reports/guides', adminController.getGuidesReport);
router.get('/reports/export', adminController.exportReport);

// ==================== AUDIT LOG ====================

router.get('/audit-log', adminController.getAuditLog);

// ==================== PAYOUTS ====================

router.get('/payouts', adminController.getPayouts);
router.post('/payouts/process', adminController.processPayouts);

// ==================== NOTIFICATIONS ====================

router.post('/notifications/send', adminController.sendNotification);
router.post('/notifications/broadcast', adminController.broadcastNotification);

export default router;
