import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMatches,
  performMatchAction,
  getConnections,
  getMatchingPreferences,
  updateMatchingPreferences,
  getMatchDetails,
  blockUser,
} from '../controllers/matchingController';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/matching
 * Get potential matches for the current user
 */
router.get('/', getMatches);

/**
 * GET /api/matching/connections
 * Get mutual connections (both users liked each other)
 */
router.get('/connections', getConnections);

/**
 * GET /api/matching/preferences
 * Get matching preferences
 */
router.get('/preferences', getMatchingPreferences);

/**
 * PUT /api/matching/preferences
 * Update matching preferences
 */
router.put('/preferences', updateMatchingPreferences);

/**
 * GET /api/matching/:matchId
 * Get match details
 */
router.get('/:matchId', getMatchDetails);

/**
 * POST /api/matching/:matchedUserId/action
 * Perform an action on a match (like, pass, block, super_like)
 */
router.post('/:matchedUserId/action', performMatchAction);

/**
 * POST /api/matching/:blockedUserId/block
 * Block a user
 */
router.post('/:blockedUserId/block', blockUser);

export default router;
