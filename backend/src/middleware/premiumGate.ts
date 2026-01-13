import { Request, Response, NextFunction } from 'express';
import { PrismaClient, SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request to include user info
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Feature definitions with required subscription tier
export const PREMIUM_FEATURES = {
  // Matching & Social
  CHAT_MATCHES: { minTier: SubscriptionTier.BASIC, description: 'Chat with matched users' },
  SUPER_LIKE: { minTier: SubscriptionTier.BASIC, description: 'Send super likes' },
  UNLIMITED_LIKES: { minTier: SubscriptionTier.BASIC, description: 'Unlimited likes per day' },

  // Profile & Visibility
  SEE_PROFILE_VIEWS: { minTier: SubscriptionTier.PREMIUM, description: 'See who viewed your profile' },
  PRIORITY_MATCHING: { minTier: SubscriptionTier.PREMIUM, description: 'Priority in matching algorithm' },
  VERIFIED_BADGE: { minTier: SubscriptionTier.PREMIUM, description: 'Premium verified badge' },
  PROFILE_BOOST: { minTier: SubscriptionTier.PREMIUM, description: 'Boost profile visibility' },

  // Activities
  UNLIMITED_ACTIVITIES: { minTier: SubscriptionTier.BASIC, description: 'Create unlimited activities' },
  FEATURED_ACTIVITIES: { minTier: SubscriptionTier.PREMIUM, description: 'Feature your activities' },

  // Business features
  BUSINESS_PROFILE: { minTier: SubscriptionTier.BUSINESS, description: 'Business profile features' },
  ANALYTICS_DASHBOARD: { minTier: SubscriptionTier.BUSINESS, description: 'Advanced analytics' },
} as const;

export type FeatureName = keyof typeof PREMIUM_FEATURES;

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.BASIC]: 1,
  [SubscriptionTier.PREMIUM]: 2,
  [SubscriptionTier.BUSINESS]: 3,
};

/**
 * Get user's current subscription tier
 */
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // No subscription or cancelled = FREE tier
  if (!subscription) {
    return SubscriptionTier.FREE;
  }

  // Check if subscription is active
  const activeStatuses: SubscriptionStatus[] = [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIALING,
  ];

  if (!activeStatuses.includes(subscription.status)) {
    return SubscriptionTier.FREE;
  }

  // Check if subscription has expired
  if (subscription.currentPeriodEnd && new Date() > subscription.currentPeriodEnd) {
    return SubscriptionTier.FREE;
  }

  return subscription.tier;
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(userId: string, feature: FeatureName): Promise<boolean> {
  const userTier = await getUserSubscriptionTier(userId);
  const featureConfig = PREMIUM_FEATURES[feature];

  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[featureConfig.minTier];
}

/**
 * Middleware to require a specific subscription tier
 */
export function requireTier(minTier: SubscriptionTier) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userTier = await getUserSubscriptionTier(req.user.id);

      if (TIER_HIERARCHY[userTier] < TIER_HIERARCHY[minTier]) {
        return res.status(403).json({
          error: 'Subscription required',
          message: `This feature requires a ${minTier} subscription or higher`,
          requiredTier: minTier,
          currentTier: userTier,
          upgradeUrl: '/subscription',
        });
      }

      next();
    } catch (error) {
      console.error('Premium gate error:', error);
      res.status(500).json({ error: 'Failed to verify subscription status' });
    }
  };
}

/**
 * Middleware to require access to a specific feature
 */
export function requireFeature(feature: FeatureName) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasAccess = await hasFeatureAccess(req.user.id, feature);

      if (!hasAccess) {
        const featureConfig = PREMIUM_FEATURES[feature];
        const userTier = await getUserSubscriptionTier(req.user.id);

        return res.status(403).json({
          error: 'Premium feature required',
          message: featureConfig.description,
          feature,
          requiredTier: featureConfig.minTier,
          currentTier: userTier,
          upgradeUrl: '/subscription',
        });
      }

      next();
    } catch (error) {
      console.error('Feature gate error:', error);
      res.status(500).json({ error: 'Failed to verify feature access' });
    }
  };
}

/**
 * Middleware that adds subscription info to request without blocking
 * Useful for optional premium features
 */
export function attachSubscriptionInfo() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.id) {
        const subscription = await prisma.subscription.findUnique({
          where: { userId: req.user.id },
        });

        const tier = subscription?.status === SubscriptionStatus.ACTIVE
          ? subscription.tier
          : SubscriptionTier.FREE;

        // Attach to request for use in route handlers
        (req as any).subscription = {
          tier,
          isActive: subscription?.status === SubscriptionStatus.ACTIVE,
          expiresAt: subscription?.currentPeriodEnd,
        };
      }
      next();
    } catch (error) {
      // Don't block on subscription check failure
      console.error('Subscription info error:', error);
      next();
    }
  };
}

/**
 * Helper to check feature access in route handlers
 */
export async function canAccessFeature(
  userId: string,
  feature: FeatureName
): Promise<{ allowed: boolean; reason?: string; upgradeUrl?: string }> {
  const hasAccess = await hasFeatureAccess(userId, feature);

  if (hasAccess) {
    return { allowed: true };
  }

  const featureConfig = PREMIUM_FEATURES[feature];
  return {
    allowed: false,
    reason: `This requires a ${featureConfig.minTier} subscription: ${featureConfig.description}`,
    upgradeUrl: '/subscription',
  };
}

/**
 * Get all features available to a user
 */
export async function getAvailableFeatures(userId: string): Promise<Record<FeatureName, boolean>> {
  const userTier = await getUserSubscriptionTier(userId);
  const userTierLevel = TIER_HIERARCHY[userTier];

  const features = {} as Record<FeatureName, boolean>;

  for (const [feature, config] of Object.entries(PREMIUM_FEATURES)) {
    features[feature as FeatureName] = userTierLevel >= TIER_HIERARCHY[config.minTier];
  }

  return features;
}
