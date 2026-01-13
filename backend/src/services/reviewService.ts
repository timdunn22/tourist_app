import { PrismaClient, ReviewStatus, VerificationLevel, ParticipantStatus, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface ReviewData {
  bookingId: string;
  experienceId: string;
  userId: string;
  overallRating: number;
  knowledgeRating?: number;
  safetyRating?: number;
  valueRating?: number;
  communicationRating?: number;
  friendlinessRating?: number;
  punctualityRating?: number;
  authenticityRating?: number;
  title?: string;
  content: string;
  images?: string[];
}

interface UserReviewData {
  reviewerId: string;
  revieweeId: string;
  activityId?: string;
  matchId?: string;
  rating: number;
  content?: string;
  badges?: string[];
}

interface ReviewWeights {
  verifiedReviewer: number;
  recentReview: number;
  detailedReview: number;
  bookingVerified: number;
}

const DEFAULT_WEIGHTS: ReviewWeights = {
  verifiedReviewer: 1.5,
  recentReview: 1.2,
  detailedReview: 1.1,
  bookingVerified: 1.3,
};

/**
 * Create a review for an experience
 */
export async function createReview(data: ReviewData): Promise<any> {
  // Verify the booking exists and belongs to the user
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { experience: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.travelerId !== data.userId) {
    throw new Error('You can only review your own bookings');
  }

  if (booking.status !== 'COMPLETED') {
    throw new Error('Can only review completed bookings');
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (existingReview) {
    throw new Error('You have already reviewed this booking');
  }

  // Get user's verification level for validation
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { verificationLevel: true },
  });

  // Create review with AI validation record
  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      experienceId: data.experienceId,
      userId: data.userId,
      overallRating: data.overallRating,
      knowledgeRating: data.knowledgeRating,
      safetyRating: data.safetyRating,
      valueRating: data.valueRating,
      communicationRating: data.communicationRating,
      friendlinessRating: data.friendlinessRating,
      punctualityRating: data.punctualityRating,
      authenticityRating: data.authenticityRating,
      title: data.title,
      content: data.content,
      images: data.images || [],
      verified: true, // GPS verified attendance
      aiValidation: {
        create: {
          bookingVerified: true,
          confidenceScore: calculateInitialConfidence(data, user?.verificationLevel),
          reviewerTrustScore: user?.verificationLevel === VerificationLevel.ID_VERIFIED ? 80 : 50,
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          verificationLevel: true,
        },
      },
      aiValidation: true,
    },
  });

  // Update experience rating
  await updateExperienceRating(data.experienceId);

  return review;
}

/**
 * Calculate initial confidence score for a review
 */
function calculateInitialConfidence(
  data: ReviewData,
  verificationLevel?: VerificationLevel | null
): number {
  let score = 50;

  // Verified user boost
  if (verificationLevel === VerificationLevel.ID_VERIFIED) {
    score += 20;
  } else if (verificationLevel === VerificationLevel.FULLY_VERIFIED) {
    score += 30;
  }

  // Detailed content boost
  if (data.content.length > 100) {
    score += 10;
  }
  if (data.content.length > 300) {
    score += 5;
  }

  // Multiple rating dimensions boost
  const ratingCount = [
    data.knowledgeRating,
    data.safetyRating,
    data.valueRating,
    data.communicationRating,
    data.friendlinessRating,
    data.punctualityRating,
    data.authenticityRating,
  ].filter((r) => r !== undefined).length;

  score += ratingCount * 3;

  return Math.min(score, 100);
}

/**
 * Update experience's weighted rating
 */
export async function updateExperienceRating(experienceId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: {
      experienceId,
      status: ReviewStatus.PUBLISHED,
    },
    include: {
      user: { select: { verificationLevel: true } },
      aiValidation: true,
    },
  });

  if (reviews.length === 0) {
    await prisma.experience.update({
      where: { id: experienceId },
      data: { rating: 0, reviewCount: 0 },
    });
    return;
  }

  let weightedSum = 0;
  let totalWeight = 0;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const review of reviews) {
    let weight = 1;

    // Verified reviewer weight
    if (review.user.verificationLevel === VerificationLevel.ID_VERIFIED) {
      weight *= DEFAULT_WEIGHTS.verifiedReviewer;
    } else if (review.user.verificationLevel === VerificationLevel.FULLY_VERIFIED) {
      weight *= DEFAULT_WEIGHTS.verifiedReviewer * 1.1;
    }

    // Recent review weight
    if (review.createdAt >= thirtyDaysAgo) {
      weight *= DEFAULT_WEIGHTS.recentReview;
    }

    // Detailed review weight
    if (review.content.length > 100) {
      weight *= DEFAULT_WEIGHTS.detailedReview;
    }

    // Booking verified weight
    if (review.aiValidation?.bookingVerified) {
      weight *= DEFAULT_WEIGHTS.bookingVerified;
    }

    // Confidence score factor
    if (review.aiValidation?.confidenceScore) {
      weight *= review.aiValidation.confidenceScore / 100;
    }

    weightedSum += review.overallRating * weight;
    totalWeight += weight;
  }

  const weightedRating = totalWeight > 0 ? weightedSum / totalWeight : 0;

  await prisma.experience.update({
    where: { id: experienceId },
    data: {
      rating: Math.round(weightedRating * 10) / 10,
      reviewCount: reviews.length,
    },
  });
}

/**
 * Get reviews for an experience
 */
export async function getExperienceReviews(
  experienceId: string,
  options: { limit?: number; offset?: number; sortBy?: string } = {}
): Promise<{ reviews: any[]; total: number; averages: any }> {
  const { limit = 20, offset = 0, sortBy = 'recent' } = options;

  const orderBy: any = {
    recent: { createdAt: 'desc' },
    helpful: { helpfulCount: 'desc' },
    rating_high: { overallRating: 'desc' },
    rating_low: { overallRating: 'asc' },
  }[sortBy] || { createdAt: 'desc' };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        experienceId,
        status: ReviewStatus.PUBLISHED,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verificationLevel: true,
          },
        },
        _count: {
          select: { helpfulnessVotes: true },
        },
      },
      orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.review.count({
      where: {
        experienceId,
        status: ReviewStatus.PUBLISHED,
      },
    }),
  ]);

  // Calculate rating averages
  const averages = await prisma.review.aggregate({
    where: {
      experienceId,
      status: ReviewStatus.PUBLISHED,
    },
    _avg: {
      overallRating: true,
      knowledgeRating: true,
      safetyRating: true,
      valueRating: true,
      communicationRating: true,
      friendlinessRating: true,
      punctualityRating: true,
      authenticityRating: true,
    },
  });

  return {
    reviews: reviews.map((r) => ({
      ...r,
      helpfulCount: r._count.helpfulnessVotes,
    })),
    total,
    averages: averages._avg,
  };
}

/**
 * Get review by ID
 */
export async function getReviewById(reviewId: string): Promise<any> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          verificationLevel: true,
        },
      },
      experience: {
        select: {
          id: true,
          title: true,
          guideId: true,
        },
      },
      aiValidation: true,
      _count: {
        select: { helpfulnessVotes: true },
      },
    },
  });

  if (!review) return null;

  return {
    ...review,
    helpfulCount: review._count.helpfulnessVotes,
  };
}

/**
 * Mark review as helpful/not helpful
 */
export async function markReviewHelpfulness(
  reviewId: string,
  userId: string,
  isHelpful: boolean
): Promise<void> {
  // Upsert helpfulness record
  await prisma.reviewHelpfulness.upsert({
    where: {
      reviewId_userId: {
        reviewId,
        userId,
      },
    },
    update: { isHelpful },
    create: {
      reviewId,
      userId,
      isHelpful,
    },
  });

  // Update helpful counts on review
  const [helpfulCount, notHelpfulCount] = await Promise.all([
    prisma.reviewHelpfulness.count({
      where: { reviewId, isHelpful: true },
    }),
    prisma.reviewHelpfulness.count({
      where: { reviewId, isHelpful: false },
    }),
  ]);

  await prisma.review.update({
    where: { id: reviewId },
    data: { helpfulCount, notHelpfulCount },
  });
}

/**
 * Add guide response to a review
 */
export async function addGuideResponse(
  reviewId: string,
  guideUserId: string,
  content: string
): Promise<any> {
  // Verify the guide owns the experience
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      experience: {
        include: {
          guide: { select: { userId: true } },
        },
      },
    },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.experience.guide.userId !== guideUserId) {
    throw new Error('Only the experience guide can respond to this review');
  }

  // Check if response already exists
  if (review.guideResponse) {
    throw new Error('Guide response already exists');
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      guideResponse: content,
      guideRespondedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Create a user-to-user review
 */
export async function createUserReview(data: UserReviewData): Promise<any> {
  // Prevent self-review
  if (data.reviewerId === data.revieweeId) {
    throw new Error('Cannot review yourself');
  }

  // Check if they had an interaction
  let hasInteraction = false;

  if (data.activityId) {
    const [reviewerParticipation, revieweeParticipation] = await Promise.all([
      prisma.activityParticipant.findFirst({
        where: { activityId: data.activityId, userId: data.reviewerId, status: ParticipantStatus.APPROVED },
      }),
      prisma.activityParticipant.findFirst({
        where: { activityId: data.activityId, userId: data.revieweeId, status: ParticipantStatus.APPROVED },
      }),
    ]);
    hasInteraction = !!reviewerParticipation && !!revieweeParticipation;
  }

  if (data.matchId) {
    const match = await prisma.userMatch.findFirst({
      where: {
        id: data.matchId,
        OR: [
          { userId: data.reviewerId, matchedUserId: data.revieweeId },
          { userId: data.revieweeId, matchedUserId: data.reviewerId },
        ],
        status: { in: [MatchStatus.MUTUAL_INTEREST, MatchStatus.CONNECTED] },
      },
    });
    hasInteraction = hasInteraction || !!match;
  }

  if (!hasInteraction) {
    throw new Error('You can only review users you have interacted with');
  }

  // Check for existing review
  const existingReview = await prisma.userReview.findFirst({
    where: {
      reviewerId: data.reviewerId,
      revieweeId: data.revieweeId,
      activityId: data.activityId,
      matchId: data.matchId,
    },
  });

  if (existingReview) {
    throw new Error('You have already reviewed this user for this interaction');
  }

  const review = await prisma.userReview.create({
    data: {
      reviewerId: data.reviewerId,
      revieweeId: data.revieweeId,
      activityId: data.activityId,
      matchId: data.matchId,
      rating: data.rating,
      content: data.content,
      badges: data.badges || [],
    },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return review;
}

/**
 * Get user reviews for a user
 */
export async function getUserReviews(
  userId: string,
  options: { limit?: number; offset?: number } = {}
): Promise<{ reviews: any[]; total: number; averageRating: number }> {
  const { limit = 20, offset = 0 } = options;

  const [reviews, total, avgResult] = await Promise.all([
    prisma.userReview.findMany({
      where: {
        revieweeId: userId,
        status: ReviewStatus.PUBLISHED,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verificationLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.userReview.count({
      where: {
        revieweeId: userId,
        status: ReviewStatus.PUBLISHED,
      },
    }),
    prisma.userReview.aggregate({
      where: {
        revieweeId: userId,
        status: ReviewStatus.PUBLISHED,
      },
      _avg: { rating: true },
    }),
  ]);

  return {
    reviews,
    total,
    averageRating: avgResult._avg.rating || 0,
  };
}

/**
 * Report a review
 */
export async function reportReview(
  reviewId: string,
  reporterId: string,
  reason: string,
  details?: string
): Promise<void> {
  // Update review report count and flag for manual review
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      reportCount: { increment: 1 },
      aiValidation: {
        update: {
          manualReview: true,
          flags: { push: `REPORTED:${reason}` },
        },
      },
    },
  });
}

/**
 * Get badge summary for a user
 */
export async function getUserBadgeSummary(
  userId: string
): Promise<{ badge: string; count: number }[]> {
  const reviews = await prisma.userReview.findMany({
    where: {
      revieweeId: userId,
      status: ReviewStatus.PUBLISHED,
    },
    select: { badges: true },
  });

  const badgeCounts: Record<string, number> = {};

  for (const review of reviews) {
    for (const badge of review.badges) {
      badgeCounts[badge] = (badgeCounts[badge] || 0) + 1;
    }
  }

  return Object.entries(badgeCounts)
    .map(([badge, count]) => ({ badge, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get review statistics for an experience
 */
export async function getExperienceReviewStats(
  experienceId: string
): Promise<any> {
  const [ratingDistribution, recentTrend] = await Promise.all([
    // Rating distribution
    prisma.review.groupBy({
      by: ['overallRating'],
      where: {
        experienceId,
        status: ReviewStatus.PUBLISHED,
      },
      _count: true,
    }),
    // Recent trend (last 30 days vs previous 30 days)
    (async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const [recent, previous] = await Promise.all([
        prisma.review.aggregate({
          where: {
            experienceId,
            status: ReviewStatus.PUBLISHED,
            createdAt: { gte: thirtyDaysAgo },
          },
          _avg: { overallRating: true },
          _count: true,
        }),
        prisma.review.aggregate({
          where: {
            experienceId,
            status: ReviewStatus.PUBLISHED,
            createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          },
          _avg: { overallRating: true },
          _count: true,
        }),
      ]);

      return {
        recent: {
          avgRating: recent._avg.overallRating,
          count: recent._count,
        },
        previous: {
          avgRating: previous._avg.overallRating,
          count: previous._count,
        },
      };
    })(),
  ]);

  // Convert rating distribution to object
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const item of ratingDistribution) {
    distribution[item.overallRating] = item._count;
  }

  return {
    distribution,
    recentTrend,
  };
}
