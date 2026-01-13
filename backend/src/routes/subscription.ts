import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { SubscriptionTier } from '@prisma/client';
import {
  createCheckoutSession,
  createBillingPortalSession,
  getUserSubscription,
  cancelSubscription,
  resumeSubscription,
  getSubscriptionPlans,
  hasFeatureAccess,
} from '../services/subscriptionService';

const router = Router();

/**
 * GET /api/subscription/plans
 * Get available subscription plans
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = getSubscriptionPlans();
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
});

/**
 * GET /api/subscription
 * Get current user's subscription
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await getUserSubscription(userId);
    res.json({ subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

/**
 * POST /api/subscription/checkout
 * Create Stripe checkout session
 */
router.post('/checkout', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { tier, successUrl, cancelUrl } = req.body;

    if (!tier) {
      return res.status(400).json({ error: 'Tier is required' });
    }

    if (!Object.values(SubscriptionTier).includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    if (tier === SubscriptionTier.FREE) {
      return res.status(400).json({ error: 'Cannot checkout for free tier' });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const finalSuccessUrl = successUrl || `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/subscription`;

    const session = await createCheckoutSession(userId, tier, finalSuccessUrl, finalCancelUrl);

    if (!session) {
      return res.status(500).json({ error: 'Failed to create checkout session' });
    }

    res.json(session);
  } catch (error: any) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

/**
 * POST /api/subscription/portal
 * Create Stripe billing portal session
 */
router.post('/portal', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { returnUrl } = req.body;
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const finalReturnUrl = returnUrl || `${baseUrl}/subscription`;

    const session = await createBillingPortalSession(userId, finalReturnUrl);

    if (!session) {
      return res.status(500).json({ error: 'Failed to create portal session' });
    }

    res.json(session);
  } catch (error: any) {
    console.error('Create portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create portal session' });
  }
});

/**
 * POST /api/subscription/cancel
 * Cancel subscription at period end
 */
router.post('/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reason } = req.body;

    await cancelSubscription(userId, reason);

    res.json({ message: 'Subscription will be cancelled at period end' });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel subscription' });
  }
});

/**
 * POST /api/subscription/resume
 * Resume a cancelled subscription
 */
router.post('/resume', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await resumeSubscription(userId);

    res.json({ message: 'Subscription resumed' });
  } catch (error: any) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to resume subscription' });
  }
});

/**
 * GET /api/subscription/feature/:feature
 * Check if user has access to a feature
 */
router.get('/feature/:feature', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { feature } = req.params;

    const hasAccess = await hasFeatureAccess(userId, feature);

    res.json({ hasAccess, feature });
  } catch (error) {
    console.error('Check feature access error:', error);
    res.status(500).json({ error: 'Failed to check feature access' });
  }
});

export default router;
