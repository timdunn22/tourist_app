import { Request, Response } from 'express';
import { PrismaClient, Gender, TravelStyle, ConnectionPreference, SocialActivityType } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Validation schemas for each step
export const stepValidations = {
  1: [
    body('dateOfBirth').optional().isISO8601().toDate(),
    body('gender').optional().isIn(Object.values(Gender)),
  ],
  2: [
    body('connectionPrefs').optional().isArray(),
    body('connectionPrefs.*').optional().isIn(Object.values(ConnectionPreference)),
    body('ageRangeMin').optional().isInt({ min: 18, max: 100 }),
    body('ageRangeMax').optional().isInt({ min: 18, max: 100 }),
  ],
  3: [
    body('activityInterests').optional().isArray(),
    body('activityInterests.*').optional().isString(),
    body('travelStyle').optional().isIn(Object.values(TravelStyle)),
  ],
  4: [
    body('dietaryRestrictions').optional().isArray(),
    body('dietaryRestrictions.*').optional().isString(),
    body('accessibilityNeeds').optional().isArray(),
    body('accessibilityNeeds.*').optional().isString(),
  ],
  5: [
    body('goalsMotivation').optional().isArray(),
    body('goalsMotivation.*').optional().isString(),
  ],
  6: [
    body('avatar').optional().isString(),
    body('bio').optional().isString().isLength({ max: 500 }),
    body('currentCity').optional().isString(),
    body('currentCountry').optional().isString(),
    body('languages').optional().isArray(),
    body('languages.*').optional().isString(),
  ],
};

// Available options for frontend
export const onboardingOptions = {
  genders: Object.values(Gender),
  connectionPreferences: Object.values(ConnectionPreference),
  travelStyles: Object.values(TravelStyle),
  activityInterests: [
    'adventure',
    'food',
    'culture',
    'nightlife',
    'nature',
    'photography',
    'sports',
    'wellness',
    'art',
    'music',
    'history',
    'shopping',
    'local_experiences',
    'workshops',
    'guided_tours',
    'parties',
  ],
  dietaryRestrictions: [
    'vegetarian',
    'vegan',
    'gluten_free',
    'halal',
    'kosher',
    'lactose_free',
    'nut_allergy',
    'none',
  ],
  accessibilityNeeds: [
    'wheelchair_accessible',
    'hearing_impaired',
    'vision_impaired',
    'mobility_limited',
    'none',
  ],
  goalsMotivation: [
    'make_friends',
    'find_travel_buddy',
    'attend_experiences',
    'learn_new_skills',
    'explore_nightlife',
    'cultural_exchange',
    'language_practice',
    'networking',
    'promote_business',
    'become_guide',
  ],
};

/**
 * Get current onboarding status
 */
export async function getOnboardingStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompleted: true,
        onboardingStep: true,
        dateOfBirth: true,
        gender: true,
        connectionPrefs: true,
        ageRangeMin: true,
        ageRangeMax: true,
        activityInterests: true,
        travelStyle: true,
        dietaryRestrictions: true,
        accessibilityNeeds: true,
        goalsMotivation: true,
        avatar: true,
        bio: true,
        currentCity: true,
        currentCountry: true,
        languages: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...user,
      options: onboardingOptions,
      totalSteps: 6,
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({ error: 'Failed to get onboarding status' });
  }
}

/**
 * Save onboarding step data
 */
export async function saveOnboardingStep(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const step = parseInt(req.params.step);
    if (isNaN(step) || step < 1 || step > 6) {
      return res.status(400).json({ error: 'Invalid step number' });
    }

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Build update data based on step
    let updateData: any = {};

    switch (step) {
      case 1:
        updateData = {
          dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined,
          gender: req.body.gender,
        };
        break;
      case 2:
        updateData = {
          connectionPrefs: req.body.connectionPrefs || [],
          ageRangeMin: req.body.ageRangeMin,
          ageRangeMax: req.body.ageRangeMax,
        };
        break;
      case 3:
        updateData = {
          activityInterests: req.body.activityInterests || [],
          travelStyle: req.body.travelStyle,
        };
        break;
      case 4:
        updateData = {
          dietaryRestrictions: req.body.dietaryRestrictions || [],
          accessibilityNeeds: req.body.accessibilityNeeds || [],
        };
        break;
      case 5:
        updateData = {
          goalsMotivation: req.body.goalsMotivation || [],
        };
        break;
      case 6:
        updateData = {
          avatar: req.body.avatar,
          bio: req.body.bio,
          currentCity: req.body.currentCity,
          currentCountry: req.body.currentCountry,
          languages: req.body.languages || [],
        };
        break;
    }

    // Update user and advance step if this is the furthest they've gotten
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingStep: true },
    });

    const newStep = Math.max(user?.onboardingStep || 0, step);

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        onboardingStep: newStep,
      },
    });

    res.json({
      message: 'Step saved successfully',
      currentStep: newStep,
      nextStep: step < 6 ? step + 1 : null,
    });
  } catch (error) {
    console.error('Save onboarding step error:', error);
    res.status(500).json({ error: 'Failed to save onboarding step' });
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has completed required fields
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingStep: true,
        dateOfBirth: true,
        activityInterests: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Minimum requirements: at least step 3 completed with some interests
    if (user.onboardingStep < 3 || user.activityInterests.length === 0) {
      return res.status(400).json({
        error: 'Please complete at least the first 3 steps with your interests',
      });
    }

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        onboardingStep: 6,
      },
    });

    res.json({
      message: 'Onboarding completed successfully',
      onboardingCompleted: true,
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
}

/**
 * Get personalized suggestions based on user preferences
 */
export async function getPersonalizedSuggestions(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        activityInterests: true,
        currentCity: true,
        currentCountry: true,
        travelStyle: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get suggested experiences based on interests
    const suggestedExperiences = await prisma.experience.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { city: user.currentCity || undefined },
          { country: user.currentCountry || undefined },
        ],
        // Match any of user's interests in tags
        tags: {
          hasSome: user.activityInterests,
        },
      },
      take: 10,
      orderBy: [{ rating: 'desc' }, { bookingCount: 'desc' }],
      include: {
        guide: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
        category: true,
      },
    });

    // Get suggested users to connect with (matching interests)
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        onboardingCompleted: true,
        status: 'ACTIVE',
        activityInterests: {
          hasSome: user.activityInterests,
        },
        // Optionally filter by location
        ...(user.currentCity && { currentCity: user.currentCity }),
      },
      take: 10,
      select: {
        id: true,
        name: true,
        avatar: true,
        activityInterests: true,
        bio: true,
        currentCity: true,
        verificationLevel: true,
      },
    });

    // Get upcoming activities in user's area
    const suggestedActivities = await prisma.socialActivity.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { gte: new Date() },
        ...(user.currentCity && { city: user.currentCity }),
        type: {
          in: mapInterestsToActivityTypes(user.activityInterests),
        },
      },
      take: 10,
      orderBy: { startDate: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verificationLevel: true,
          },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    res.json({
      experiences: suggestedExperiences,
      users: suggestedUsers,
      activities: suggestedActivities,
      matchedInterests: user.activityInterests,
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to get personalized suggestions' });
  }
}

/**
 * Skip onboarding (minimal completion)
 */
export async function skipOnboarding(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        onboardingStep: 0, // Indicates skipped
      },
    });

    res.json({
      message: 'Onboarding skipped',
      onboardingCompleted: true,
    });
  } catch (error) {
    console.error('Skip onboarding error:', error);
    res.status(500).json({ error: 'Failed to skip onboarding' });
  }
}

// Helper function to map interests to activity types
function mapInterestsToActivityTypes(interests: string[]): SocialActivityType[] {
  const mapping: Record<string, SocialActivityType[]> = {
    adventure: [SocialActivityType.HIKING, SocialActivityType.SPORTS],
    food: [SocialActivityType.DINING, SocialActivityType.FOOD_CRAWL],
    culture: [SocialActivityType.CULTURAL, SocialActivityType.GUIDED_TOUR],
    nightlife: [SocialActivityType.NIGHTLIFE, SocialActivityType.PARTY],
    nature: [SocialActivityType.HIKING, SocialActivityType.PHOTOGRAPHY],
    photography: [SocialActivityType.PHOTOGRAPHY],
    sports: [SocialActivityType.SPORTS, SocialActivityType.HIKING],
    wellness: [SocialActivityType.WORKSHOP],
    art: [SocialActivityType.CULTURAL, SocialActivityType.WORKSHOP],
    music: [SocialActivityType.NIGHTLIFE, SocialActivityType.PARTY],
    workshops: [SocialActivityType.WORKSHOP],
    guided_tours: [SocialActivityType.GUIDED_TOUR],
    parties: [SocialActivityType.PARTY, SocialActivityType.NIGHTLIFE],
    local_experiences: [SocialActivityType.CULTURAL, SocialActivityType.FOOD_CRAWL],
  };

  const activityTypes = new Set<SocialActivityType>();
  for (const interest of interests) {
    const types = mapping[interest.toLowerCase()] || [];
    types.forEach((t) => activityTypes.add(t));
  }

  return Array.from(activityTypes);
}
