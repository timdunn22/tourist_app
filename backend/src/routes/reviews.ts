import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
  createReview,
  getExperienceReviews,
  getReviewById,
  markReviewHelpfulness,
  addGuideResponse,
  createUserReview,
  getUserReviews,
  getUserBadgeSummary,
  getExperienceReviewStats,
  reportReview,
} from '../services/reviewService';

const router = Router();

/**
 * GET /api/reviews/experience/:experienceId
 * Get reviews for an experience
 */
router.get('/experience/:experienceId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { experienceId } = req.params;
    const { limit = '20', offset = '0', sortBy = 'recent' } = req.query;

    const result = await getExperienceReviews(experienceId, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as string,
    });

    res.json(result);
  } catch (error) {
    console.error('Get experience reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

/**
 * GET /api/reviews/experience/:experienceId/stats
 * Get review statistics for an experience
 */
router.get('/experience/:experienceId/stats', async (req: Request, res: Response) => {
  try {
    const { experienceId } = req.params;

    const stats = await getExperienceReviewStats(experienceId);

    res.json(stats);
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: 'Failed to get review stats' });
  }
});

/**
 * POST /api/reviews/experience/:experienceId
 * Create a review for an experience
 */
router.post('/experience/:experienceId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { experienceId } = req.params;
    const {
      bookingId,
      overallRating,
      knowledgeRating,
      safetyRating,
      valueRating,
      communicationRating,
      title,
      content,
      images,
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ error: 'Overall rating must be between 1 and 5' });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: 'Review content must be at least 10 characters' });
    }

    const review = await createReview({
      bookingId,
      experienceId,
      userId,
      overallRating,
      knowledgeRating,
      safetyRating,
      valueRating,
      communicationRating,
      title,
      content: content.trim(),
      images,
    });

    res.status(201).json({ review });
  } catch (error: any) {
    console.error('Create review error:', error);
    if (error.message) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
});

/**
 * GET /api/reviews/:reviewId
 * Get a specific review
 */
router.get('/:reviewId', async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const review = await getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to get review' });
  }
});

/**
 * POST /api/reviews/:reviewId/helpful
 * Mark a review as helpful or not helpful
 */
router.post('/:reviewId/helpful', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const { isHelpful } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({ error: 'isHelpful must be a boolean' });
    }

    await markReviewHelpfulness(reviewId, userId, isHelpful);

    res.json({ message: 'Helpfulness recorded' });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark review helpfulness' });
  }
});

/**
 * POST /api/reviews/:reviewId/response
 * Add guide response to a review
 */
router.post('/:reviewId/response', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ error: 'Response must be at least 10 characters' });
    }

    const response = await addGuideResponse(reviewId, userId, content.trim());

    res.status(201).json({ response });
  } catch (error: any) {
    console.error('Add guide response error:', error);
    if (error.message) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to add response' });
  }
});

/**
 * POST /api/reviews/:reviewId/report
 * Report a review
 */
router.post('/:reviewId/report', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const { reason, details } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    await reportReview(reviewId, userId, reason, details);

    res.json({ message: 'Report submitted. Our team will review it.' });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ error: 'Failed to report review' });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Get user-to-user reviews for a user
 */
router.get('/user/:userId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = '20', offset = '0' } = req.query;

    const result = await getUserReviews(userId, {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    res.json(result);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to get user reviews' });
  }
});

/**
 * GET /api/reviews/user/:userId/badges
 * Get badge summary for a user
 */
router.get('/user/:userId/badges', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const badges = await getUserBadgeSummary(userId);

    res.json({ badges });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

/**
 * POST /api/reviews/user/:userId
 * Create a user-to-user review
 */
router.post('/user/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const reviewerId = req.user?.id;
    const { userId: revieweeId } = req.params;
    const { activityId, matchId, rating, content, badges } = req.body;

    if (!reviewerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!activityId && !matchId) {
      return res.status(400).json({
        error: 'Either activityId or matchId is required to verify interaction'
      });
    }

    const review = await createUserReview({
      reviewerId,
      revieweeId,
      activityId,
      matchId,
      rating,
      content,
      badges,
    });

    res.status(201).json({ review });
  } catch (error: any) {
    console.error('Create user review error:', error);
    if (error.message) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
});

export default router;
