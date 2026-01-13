import { Request, Response } from 'express';
import { PrismaClient, MatchAction } from '@prisma/client';
import {
  findMatches,
  processMatchAction,
  getMutualConnections,
  refreshMatches,
} from '../services/matchingService';
import { hasFeatureAccess } from '../middleware/premiumGate';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Get potential matches for the current user
 */
export async function getMatches(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit = '20', offset = '0' } = req.query;

    // Check if user has completed onboarding
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true, activityInterests: true },
    });

    if (!user?.onboardingCompleted || user.activityInterests.length === 0) {
      return res.status(400).json({
        error: 'Please complete your profile first',
        message: 'You need to complete onboarding and add interests to see matches',
        redirectTo: '/onboarding',
      });
    }

    const matches = await findMatches(userId, parseInt(limit as string), parseInt(offset as string));

    // Check if user can message matches (premium feature)
    const canMessage = await hasFeatureAccess(userId, 'CHAT_MATCHES');

    res.json({
      matches,
      canMessage,
      upgradePrompt: !canMessage
        ? 'Upgrade to Basic to message your matches'
        : undefined,
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
}

/**
 * Perform an action on a match (like, pass, block)
 */
export async function performMatchAction(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { matchedUserId } = req.params;
    const { action } = req.body;

    if (!matchedUserId) {
      return res.status(400).json({ error: 'Matched user ID is required' });
    }

    if (!action || !Object.values(MatchAction).includes(action)) {
      return res.status(400).json({
        error: 'Invalid action',
        validActions: Object.values(MatchAction),
      });
    }

    // Check for super like (premium feature)
    if (action === MatchAction.SUPER_LIKE) {
      const canSuperLike = await hasFeatureAccess(userId, 'SUPER_LIKE');
      if (!canSuperLike) {
        return res.status(403).json({
          error: 'Premium feature required',
          message: 'Super likes require a Basic subscription or higher',
          upgradeUrl: '/subscription',
        });
      }
    }

    const result = await processMatchAction(userId, matchedUserId, action);

    res.json({
      success: true,
      isMutual: result.isMutual,
      message: result.isMutual
        ? "It's a match! You can now message each other."
        : `Action '${action}' recorded`,
      match: {
        id: result.match.id,
        status: result.match.status,
        compatibilityScore: result.match.compatibilityScore,
      },
    });
  } catch (error) {
    console.error('Match action error:', error);
    res.status(500).json({ error: 'Failed to process match action' });
  }
}

/**
 * Get mutual connections (both users liked each other)
 */
export async function getConnections(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connections = await getMutualConnections(userId);

    // Check if user can message connections
    const canMessage = await hasFeatureAccess(userId, 'CHAT_MATCHES');

    res.json({
      connections,
      canMessage,
      upgradePrompt: !canMessage
        ? 'Upgrade to Basic to message your connections'
        : undefined,
    });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Failed to get connections' });
  }
}

/**
 * Get matching preferences
 */
export async function getMatchingPreferences(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        connectionPrefs: true,
        ageRangeMin: true,
        ageRangeMax: true,
        activityInterests: true,
        currentCity: true,
        currentCountry: true,
        travelStyle: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ preferences: user });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
}

/**
 * Update matching preferences
 */
export async function updateMatchingPreferences(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      connectionPrefs,
      ageRangeMin,
      ageRangeMax,
      activityInterests,
      currentCity,
      currentCountry,
      travelStyle,
    } = req.body;

    // Validate age range
    if (ageRangeMin !== undefined && ageRangeMax !== undefined) {
      if (ageRangeMin < 18 || ageRangeMax > 100 || ageRangeMin > ageRangeMax) {
        return res.status(400).json({
          error: 'Invalid age range. Min must be 18+, max must be 100 or less, and min must be less than max.',
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        connectionPrefs: connectionPrefs !== undefined ? connectionPrefs : undefined,
        ageRangeMin: ageRangeMin !== undefined ? ageRangeMin : undefined,
        ageRangeMax: ageRangeMax !== undefined ? ageRangeMax : undefined,
        activityInterests: activityInterests !== undefined ? activityInterests : undefined,
        currentCity: currentCity !== undefined ? currentCity : undefined,
        currentCountry: currentCountry !== undefined ? currentCountry : undefined,
        travelStyle: travelStyle !== undefined ? travelStyle : undefined,
      },
      select: {
        connectionPrefs: true,
        ageRangeMin: true,
        ageRangeMax: true,
        activityInterests: true,
        currentCity: true,
        currentCountry: true,
        travelStyle: true,
      },
    });

    // Refresh matches with new preferences
    await refreshMatches(userId);

    res.json({
      message: 'Preferences updated successfully',
      preferences: user,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
}

/**
 * Get match details
 */
export async function getMatchDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { matchId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const match = await prisma.userMatch.findFirst({
      where: {
        id: matchId,
        OR: [{ userId }, { matchedUserId: userId }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            activityInterests: true,
            currentCity: true,
            currentCountry: true,
            travelStyle: true,
            verificationLevel: true,
            dateOfBirth: true,
          },
        },
        matchedUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            activityInterests: true,
            currentCity: true,
            currentCountry: true,
            travelStyle: true,
            verificationLevel: true,
            dateOfBirth: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Return the other user's profile
    const otherUser = match.userId === userId ? match.matchedUser : match.user;

    // Check if user can message
    const canMessage = await hasFeatureAccess(userId, 'CHAT_MATCHES');

    res.json({
      match: {
        id: match.id,
        status: match.status,
        compatibilityScore: match.compatibilityScore,
        matchFactors: match.matchFactors,
        connectedAt: match.connectedAt,
      },
      user: otherUser,
      canMessage,
    });
  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({ error: 'Failed to get match details' });
  }
}

/**
 * Block a user (removes from matches and prevents future matches)
 */
export async function blockUser(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { blockedUserId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (blockedUserId === userId) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    await processMatchAction(userId, blockedUserId, MatchAction.BLOCK);

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
}
