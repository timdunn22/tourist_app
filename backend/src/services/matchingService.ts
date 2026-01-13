import { PrismaClient, User, MatchStatus, MatchAction, VerificationLevel } from '@prisma/client';

const prisma = new PrismaClient();

// Weights for different matching factors
const MATCH_WEIGHTS = {
  interests: 40,      // Shared interests (most important)
  age: 20,           // Age compatibility
  location: 20,      // Same city/country
  verification: 10,  // Verified users bonus
  activity: 10,      // Active users bonus
};

interface MatchCriteria {
  interests: string[];
  ageRangeMin?: number;
  ageRangeMax?: number;
  connectionPrefs: string[];
  currentCity?: string;
  currentCountry?: string;
  travelStyle?: string;
}

interface MatchResult {
  userId: string;
  compatibilityScore: number;
  matchFactors: Record<string, number>;
  user: Partial<User>;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate interest overlap score (0-100)
 */
function calculateInterestScore(userInterests: string[], otherInterests: string[]): number {
  if (userInterests.length === 0 || otherInterests.length === 0) {
    return 0;
  }

  const commonInterests = userInterests.filter((i) => otherInterests.includes(i));
  const unionSize = new Set([...userInterests, ...otherInterests]).size;

  return Math.round((commonInterests.length / unionSize) * 100);
}

/**
 * Calculate age compatibility score (0-100)
 */
function calculateAgeScore(
  userAge: number | null,
  otherAge: number | null,
  ageRangeMin?: number,
  ageRangeMax?: number
): number {
  if (userAge === null || otherAge === null) {
    return 50; // Neutral if age unknown
  }

  // Check if within preferred range
  const minAge = ageRangeMin || 18;
  const maxAge = ageRangeMax || 100;

  if (otherAge >= minAge && otherAge <= maxAge) {
    // Within range - calculate how centered they are
    const rangeCenter = (minAge + maxAge) / 2;
    const distanceFromCenter = Math.abs(otherAge - rangeCenter);
    const rangeSize = (maxAge - minAge) / 2;

    return Math.round(100 - (distanceFromCenter / rangeSize) * 30);
  }

  // Outside range
  return 0;
}

/**
 * Calculate location score (0-100)
 */
function calculateLocationScore(
  userCity: string | null,
  userCountry: string | null,
  otherCity: string | null,
  otherCountry: string | null
): number {
  if (userCity && otherCity && userCity.toLowerCase() === otherCity.toLowerCase()) {
    return 100; // Same city
  }

  if (userCountry && otherCountry && userCountry.toLowerCase() === otherCountry.toLowerCase()) {
    return 50; // Same country
  }

  return 0; // Different locations
}

/**
 * Calculate verification score (0-100)
 */
function calculateVerificationScore(verificationLevel: VerificationLevel): number {
  const scores: Record<VerificationLevel, number> = {
    UNVERIFIED: 0,
    EMAIL_VERIFIED: 25,
    PHONE_VERIFIED: 50,
    ID_VERIFIED: 75,
    FULLY_VERIFIED: 100,
  };

  return scores[verificationLevel] || 0;
}

/**
 * Calculate activity score based on user engagement (0-100)
 */
async function calculateActivityScore(userId: string): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentLogins, completedActivities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true, createdAt: true },
    }),
    prisma.activityParticipant.count({
      where: {
        userId,
        status: 'APPROVED',
        joinedAt: { gte: thirtyDaysAgo },
      },
    }),
  ]);

  let score = 0;

  // Recent login bonus
  if (recentLogins?.lastLoginAt) {
    const daysSinceLogin =
      (Date.now() - recentLogins.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin < 1) score += 50;
    else if (daysSinceLogin < 7) score += 30;
    else if (daysSinceLogin < 30) score += 10;
  }

  // Activity participation bonus
  score += Math.min(completedActivities * 10, 50);

  return score;
}

/**
 * Check gender/connection preference compatibility
 */
function checkConnectionPreference(
  userGender: string | null,
  userPrefs: string[],
  otherGender: string | null,
  otherPrefs: string[]
): boolean {
  // If no preferences, allow any
  if (userPrefs.length === 0 || userPrefs.includes('ANY')) {
    return true;
  }

  if (!otherGender) {
    return true; // Allow if gender unknown
  }

  // Check if other user's gender matches user's preferences
  const otherMatchesUser = userPrefs.includes(otherGender) || userPrefs.includes('ANY');

  // Check if user's gender matches other's preferences (mutual check)
  const userMatchesOther =
    otherPrefs.length === 0 ||
    otherPrefs.includes('ANY') ||
    (userGender !== null && otherPrefs.includes(userGender));

  return otherMatchesUser && userMatchesOther;
}

/**
 * Calculate overall compatibility score between two users
 */
export async function calculateCompatibility(
  user: Partial<User>,
  otherUser: Partial<User>
): Promise<{ score: number; factors: Record<string, number> }> {
  const factors: Record<string, number> = {};

  // Interest score
  factors.interests = calculateInterestScore(
    user.activityInterests || [],
    otherUser.activityInterests || []
  );

  // Age score
  const userAge = user.dateOfBirth ? calculateAge(user.dateOfBirth) : null;
  const otherAge = otherUser.dateOfBirth ? calculateAge(otherUser.dateOfBirth) : null;
  factors.age = calculateAgeScore(userAge, otherAge, user.ageRangeMin || undefined, user.ageRangeMax || undefined);

  // Location score
  factors.location = calculateLocationScore(
    user.currentCity || null,
    user.currentCountry || null,
    otherUser.currentCity || null,
    otherUser.currentCountry || null
  );

  // Verification score
  factors.verification = calculateVerificationScore(
    otherUser.verificationLevel || VerificationLevel.UNVERIFIED
  );

  // Activity score
  factors.activity = otherUser.id ? await calculateActivityScore(otherUser.id) : 0;

  // Calculate weighted total
  const totalScore =
    (factors.interests * MATCH_WEIGHTS.interests +
      factors.age * MATCH_WEIGHTS.age +
      factors.location * MATCH_WEIGHTS.location +
      factors.verification * MATCH_WEIGHTS.verification +
      factors.activity * MATCH_WEIGHTS.activity) /
    100;

  return {
    score: Math.round(totalScore),
    factors,
  };
}

/**
 * Find potential matches for a user
 */
export async function findMatches(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<MatchResult[]> {
  // Get the user's profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      gender: true,
      connectionPrefs: true,
      ageRangeMin: true,
      ageRangeMax: true,
      activityInterests: true,
      currentCity: true,
      currentCountry: true,
      dateOfBirth: true,
      travelStyle: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get existing matches/blocks to exclude
  const existingMatches = await prisma.userMatch.findMany({
    where: {
      OR: [{ userId }, { matchedUserId: userId }],
    },
    select: {
      userId: true,
      matchedUserId: true,
      status: true,
    },
  });

  const excludeUserIds = new Set<string>([userId]);
  existingMatches.forEach((m) => {
    // Exclude blocked users
    if (m.status === MatchStatus.BLOCKED) {
      excludeUserIds.add(m.userId);
      excludeUserIds.add(m.matchedUserId);
    }
    // Also exclude already matched users (they're in another flow)
    if (m.status === MatchStatus.CONNECTED || m.status === MatchStatus.MUTUAL_INTEREST) {
      excludeUserIds.add(m.userId);
      excludeUserIds.add(m.matchedUserId);
    }
  });

  // Find potential matches
  const potentialMatches = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludeUserIds) },
      onboardingCompleted: true,
      status: 'ACTIVE',
      // Must have some interests
      activityInterests: { isEmpty: false },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      bio: true,
      gender: true,
      connectionPrefs: true,
      ageRangeMin: true,
      ageRangeMax: true,
      activityInterests: true,
      currentCity: true,
      currentCountry: true,
      dateOfBirth: true,
      travelStyle: true,
      verificationLevel: true,
      lastLoginAt: true,
    },
  });

  // Calculate compatibility and filter by connection preferences
  const matchResults: MatchResult[] = [];

  for (const otherUser of potentialMatches) {
    // Check connection preference compatibility
    const prefCompatible = checkConnectionPreference(
      user.gender,
      user.connectionPrefs,
      otherUser.gender,
      otherUser.connectionPrefs
    );

    if (!prefCompatible) continue;

    const { score, factors } = await calculateCompatibility(user, otherUser);

    // Only include if minimum compatibility threshold met
    if (score >= 20) {
      matchResults.push({
        userId: otherUser.id,
        compatibilityScore: score,
        matchFactors: factors,
        user: otherUser,
      });
    }
  }

  // Sort by compatibility score (highest first)
  matchResults.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Apply pagination
  return matchResults.slice(offset, offset + limit);
}

/**
 * Create or update a match entry
 */
export async function processMatchAction(
  userId: string,
  matchedUserId: string,
  action: MatchAction
): Promise<{ match: any; isMutual: boolean }> {
  // Check if match already exists (in either direction)
  let match = await prisma.userMatch.findFirst({
    where: {
      OR: [
        { userId, matchedUserId },
        { userId: matchedUserId, matchedUserId: userId },
      ],
    },
  });

  const isInitiator = !match || match.userId === userId;

  if (!match) {
    // Get compatibility score
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const otherUser = await prisma.user.findUnique({ where: { id: matchedUserId } });

    if (!user || !otherUser) {
      throw new Error('User not found');
    }

    const { score, factors } = await calculateCompatibility(user, otherUser);

    // Create new match
    match = await prisma.userMatch.create({
      data: {
        userId,
        matchedUserId,
        compatibilityScore: score,
        matchFactors: factors,
        status: MatchStatus.PENDING,
        userAction: action,
        userActionAt: new Date(),
      },
    });
  } else {
    // Update existing match
    const updateData: any = isInitiator
      ? { userAction: action, userActionAt: new Date() }
      : { matchedUserAction: action, matchedUserActionAt: new Date() };

    // Check for mutual interest
    const otherAction = isInitiator ? match.matchedUserAction : match.userAction;

    if (action === MatchAction.LIKE || action === MatchAction.SUPER_LIKE) {
      if (otherAction === MatchAction.LIKE || otherAction === MatchAction.SUPER_LIKE) {
        updateData.status = MatchStatus.MUTUAL_INTEREST;
        updateData.connectedAt = new Date();
      }
    } else if (action === MatchAction.BLOCK) {
      updateData.status = MatchStatus.BLOCKED;
    }

    match = await prisma.userMatch.update({
      where: { id: match.id },
      data: updateData,
    });
  }

  const isMutual = match.status === MatchStatus.MUTUAL_INTEREST;

  // If mutual interest, create notification for both users
  if (isMutual) {
    const users = await prisma.user.findMany({
      where: { id: { in: [userId, matchedUserId] } },
      select: { id: true, name: true },
    });

    for (const u of users) {
      const otherName = users.find((x) => x.id !== u.id)?.name || 'Someone';
      await prisma.notification.create({
        data: {
          userId: u.id,
          type: 'MUTUAL_MATCH',
          title: "It's a Match!",
          message: `You and ${otherName} liked each other. Start a conversation!`,
          data: { matchId: match.id },
        },
      });
    }
  }

  return { match, isMutual };
}

/**
 * Get mutual connections (users who both liked each other)
 */
export async function getMutualConnections(userId: string): Promise<any[]> {
  const matches = await prisma.userMatch.findMany({
    where: {
      OR: [{ userId }, { matchedUserId: userId }],
      status: {
        in: [MatchStatus.MUTUAL_INTEREST, MatchStatus.CONNECTED],
      },
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
          verificationLevel: true,
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
          verificationLevel: true,
        },
      },
    },
    orderBy: { connectedAt: 'desc' },
  });

  // Return the other user in each match
  return matches.map((match) => ({
    matchId: match.id,
    connectedAt: match.connectedAt,
    compatibilityScore: match.compatibilityScore,
    status: match.status,
    user: match.userId === userId ? match.matchedUser : match.user,
  }));
}

/**
 * Refresh matches for a user (can be called periodically)
 */
export async function refreshMatches(userId: string): Promise<void> {
  // Expire old suggested matches that weren't acted upon
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await prisma.userMatch.updateMany({
    where: {
      userId,
      status: MatchStatus.SUGGESTED,
      createdAt: { lt: thirtyDaysAgo },
    },
    data: {
      status: MatchStatus.EXPIRED,
    },
  });
}
