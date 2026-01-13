import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
  getActivities,
  createActivity,
  getActivityDetails,
  updateActivity,
  cancelActivity,
  rsvpActivity,
  cancelRsvp,
  manageParticipant,
  getActivityChat,
  sendActivityMessage,
  getMyActivities,
} from '../controllers/activityController';

const router = Router();

/**
 * GET /api/activities
 * Get activities with filters (public)
 */
router.get('/', optionalAuth, getActivities);

/**
 * GET /api/activities/mine
 * Get user's activities (created or participating)
 */
router.get('/mine', authenticate, getMyActivities);

/**
 * POST /api/activities
 * Create a new activity
 */
router.post('/', authenticate, createActivity);

/**
 * GET /api/activities/:id
 * Get activity details
 */
router.get('/:id', optionalAuth, getActivityDetails);

/**
 * PUT /api/activities/:id
 * Update an activity (creator only)
 */
router.put('/:id', authenticate, updateActivity);

/**
 * DELETE /api/activities/:id
 * Cancel an activity (creator only)
 */
router.delete('/:id', authenticate, cancelActivity);

/**
 * POST /api/activities/:id/rsvp
 * RSVP to an activity
 */
router.post('/:id/rsvp', authenticate, rsvpActivity);

/**
 * DELETE /api/activities/:id/rsvp
 * Cancel RSVP
 */
router.delete('/:id/rsvp', authenticate, cancelRsvp);

/**
 * PUT /api/activities/:id/participants/:participantUserId
 * Approve or decline a participant (host only)
 */
router.put('/:id/participants/:participantUserId', authenticate, manageParticipant);

/**
 * GET /api/activities/:id/chat
 * Get activity chat messages
 */
router.get('/:id/chat', authenticate, getActivityChat);

/**
 * POST /api/activities/:id/chat
 * Send activity chat message
 */
router.post('/:id/chat', authenticate, sendActivityMessage);

export default router;
