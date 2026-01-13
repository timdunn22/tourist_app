import { Request, Response } from 'express';
import {
  PrismaClient,
  SocialActivityType,
  SocialActivityStatus,
  ActivityVisibility,
  ParticipantStatus,
  ParticipantRole,
} from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Get activities with filters
 */
export async function getActivities(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const {
      type,
      city,
      country,
      status = 'ACTIVE',
      startDate,
      endDate,
      page = '1',
      limit = '20',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      status: status as SocialActivityStatus,
      visibility: { in: [ActivityVisibility.PUBLIC] },
    };

    // Add verified-only activities if user is verified
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { verificationLevel: true },
      });

      if (user?.verificationLevel === 'ID_VERIFIED' || user?.verificationLevel === 'FULLY_VERIFIED') {
        where.visibility = {
          in: [ActivityVisibility.PUBLIC, ActivityVisibility.VERIFIED_ONLY],
        };
      }
    }

    if (type) {
      where.type = type as SocialActivityType;
    }

    if (city) {
      where.city = { contains: city as string, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country as string, mode: 'insensitive' };
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate as string) };
    } else {
      // Default to future activities only
      where.startDate = { gte: new Date() };
    }

    if (endDate) {
      where.startDate = {
        ...where.startDate,
        lte: new Date(endDate as string),
      };
    }

    const [activities, total] = await Promise.all([
      prisma.socialActivity.findMany({
        where,
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
        orderBy: { startDate: 'asc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.socialActivity.count({ where }),
    ]);

    res.json({
      activities,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
}

/**
 * Create a new activity
 */
export async function createActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      title,
      description,
      type,
      location,
      latitude,
      longitude,
      city,
      country,
      meetingPoint,
      startDate,
      endDate,
      duration,
      minParticipants,
      maxParticipants,
      visibility,
      requiresApproval,
      ageRestriction,
      genderRestriction,
      verifiedOnly,
      images,
      coverImage,
      isFree,
      price,
      currency,
    } = req.body;

    // Validate required fields
    if (!title || !description || !type || !location || !city || !country || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'type', 'location', 'city', 'country', 'startDate'],
      });
    }

    // Validate activity type
    if (!Object.values(SocialActivityType).includes(type)) {
      return res.status(400).json({
        error: 'Invalid activity type',
        validTypes: Object.values(SocialActivityType),
      });
    }

    // Create activity
    const activity = await prisma.socialActivity.create({
      data: {
        creatorId: userId,
        title,
        description,
        type,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        city,
        country,
        meetingPoint,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        duration: duration ? parseInt(duration) : null,
        minParticipants: minParticipants || 2,
        maxParticipants: maxParticipants || 10,
        visibility: visibility || ActivityVisibility.PUBLIC,
        requiresApproval: requiresApproval || false,
        ageRestriction: ageRestriction ? parseInt(ageRestriction) : null,
        genderRestriction,
        verifiedOnly: verifiedOnly || false,
        images: images || [],
        coverImage,
        isFree: isFree !== false,
        price: price ? parseFloat(price) : null,
        currency: currency || 'USD',
        status: SocialActivityStatus.ACTIVE,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Create activity chat
    await prisma.activityChat.create({
      data: {
        activityId: activity.id,
        isEnabled: true,
        participantsOnly: true,
      },
    });

    // Add creator as host participant
    await prisma.activityParticipant.create({
      data: {
        activityId: activity.id,
        userId,
        status: ParticipantStatus.APPROVED,
        role: ParticipantRole.HOST,
        joinedAt: new Date(),
      },
    });

    // Update participant count
    await prisma.socialActivity.update({
      where: { id: activity.id },
      data: { currentParticipants: 1 },
    });

    res.status(201).json({
      message: 'Activity created successfully',
      activity,
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
}

/**
 * Get activity details
 */
export async function getActivityDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const activity = await prisma.socialActivity.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            verificationLevel: true,
          },
        },
        participants: {
          where: { status: ParticipantStatus.APPROVED },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                verificationLevel: true,
              },
            },
          },
        },
        chat: {
          select: {
            id: true,
            isEnabled: true,
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Check if user is a participant
    let userParticipation = null;
    if (userId) {
      userParticipation = await prisma.activityParticipant.findUnique({
        where: {
          activityId_userId: {
            activityId: id,
            userId,
          },
        },
      });
    }

    res.json({
      activity,
      isCreator: activity.creatorId === userId,
      userParticipation,
      spotsAvailable: activity.maxParticipants - activity.currentParticipants,
    });
  } catch (error) {
    console.error('Get activity details error:', error);
    res.status(500).json({ error: 'Failed to get activity details' });
  }
}

/**
 * Update an activity
 */
export async function updateActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activity = await prisma.socialActivity.findUnique({
      where: { id },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.creatorId !== userId) {
      return res.status(403).json({ error: 'Only the creator can update this activity' });
    }

    const updateData: any = {};
    const allowedFields = [
      'title',
      'description',
      'location',
      'meetingPoint',
      'startDate',
      'endDate',
      'duration',
      'maxParticipants',
      'visibility',
      'requiresApproval',
      'images',
      'coverImage',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Convert dates
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const updatedActivity = await prisma.socialActivity.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: 'Activity updated successfully',
      activity: updatedActivity,
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
}

/**
 * Cancel an activity
 */
export async function cancelActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activity = await prisma.socialActivity.findUnique({
      where: { id },
      include: {
        participants: {
          where: { status: ParticipantStatus.APPROVED },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.creatorId !== userId) {
      return res.status(403).json({ error: 'Only the creator can cancel this activity' });
    }

    // Update status
    await prisma.socialActivity.update({
      where: { id },
      data: { status: SocialActivityStatus.CANCELLED },
    });

    // Notify all participants
    for (const participant of activity.participants) {
      if (participant.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: participant.userId,
            type: 'ACTIVITY_CANCELLED',
            title: 'Activity Cancelled',
            message: `The activity "${activity.title}" has been cancelled by the host.`,
            data: { activityId: id },
          },
        });
      }
    }

    res.json({ message: 'Activity cancelled successfully' });
  } catch (error) {
    console.error('Cancel activity error:', error);
    res.status(500).json({ error: 'Failed to cancel activity' });
  }
}

/**
 * RSVP to an activity
 */
export async function rsvpActivity(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activity = await prisma.socialActivity.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true } },
      },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.status !== SocialActivityStatus.ACTIVE) {
      return res.status(400).json({ error: 'Activity is not accepting RSVPs' });
    }

    if (activity.currentParticipants >= activity.maxParticipants) {
      return res.status(400).json({ error: 'Activity is full' });
    }

    // Check if already participating
    const existingParticipation = await prisma.activityParticipant.findUnique({
      where: {
        activityId_userId: { activityId: id, userId },
      },
    });

    if (existingParticipation) {
      return res.status(400).json({
        error: 'Already RSVP\'d to this activity',
        status: existingParticipation.status,
      });
    }

    // Check verification requirement
    if (activity.verifiedOnly) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { verificationLevel: true },
      });

      if (
        user?.verificationLevel !== 'ID_VERIFIED' &&
        user?.verificationLevel !== 'FULLY_VERIFIED'
      ) {
        return res.status(403).json({
          error: 'This activity requires ID verification',
          redirectTo: '/verification',
        });
      }
    }

    // Create participation
    const status = activity.requiresApproval
      ? ParticipantStatus.PENDING
      : ParticipantStatus.APPROVED;

    const participation = await prisma.activityParticipant.create({
      data: {
        activityId: id,
        userId,
        status,
        message,
        joinedAt: status === ParticipantStatus.APPROVED ? new Date() : null,
      },
    });

    // Update participant count if auto-approved
    if (status === ParticipantStatus.APPROVED) {
      await prisma.socialActivity.update({
        where: { id },
        data: { currentParticipants: { increment: 1 } },
      });
    }

    // Notify host
    await prisma.notification.create({
      data: {
        userId: activity.creatorId,
        type: 'NEW_RSVP',
        title: 'New RSVP',
        message: activity.requiresApproval
          ? `Someone wants to join your activity "${activity.title}". Review their request.`
          : `Someone joined your activity "${activity.title}"`,
        data: { activityId: id, participantId: userId },
      },
    });

    res.json({
      message: activity.requiresApproval
        ? 'RSVP request sent. Waiting for host approval.'
        : 'Successfully joined the activity!',
      status,
      participation,
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Failed to RSVP' });
  }
}

/**
 * Cancel RSVP
 */
export async function cancelRsvp(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const participation = await prisma.activityParticipant.findUnique({
      where: {
        activityId_userId: { activityId: id, userId },
      },
    });

    if (!participation) {
      return res.status(404).json({ error: 'Not participating in this activity' });
    }

    // Host cannot leave their own activity (must cancel it)
    if (participation.role === ParticipantRole.HOST) {
      return res.status(400).json({
        error: 'Hosts cannot leave. Cancel the activity instead.',
      });
    }

    // Delete participation
    await prisma.activityParticipant.delete({
      where: { id: participation.id },
    });

    // Update participant count if was approved
    if (participation.status === ParticipantStatus.APPROVED) {
      await prisma.socialActivity.update({
        where: { id },
        data: { currentParticipants: { decrement: 1 } },
      });
    }

    res.json({ message: 'RSVP cancelled successfully' });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({ error: 'Failed to cancel RSVP' });
  }
}

/**
 * Approve or decline a participant (host only)
 */
export async function manageParticipant(req: AuthenticatedRequest, res: Response) {
  try {
    const { id, participantUserId } = req.params;
    const userId = req.user?.id;
    const { action, reason } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['approve', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "decline"' });
    }

    const activity = await prisma.socialActivity.findUnique({
      where: { id },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.creatorId !== userId) {
      return res.status(403).json({ error: 'Only the host can manage participants' });
    }

    const participation = await prisma.activityParticipant.findUnique({
      where: {
        activityId_userId: { activityId: id, userId: participantUserId },
      },
    });

    if (!participation) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const newStatus =
      action === 'approve' ? ParticipantStatus.APPROVED : ParticipantStatus.DECLINED;

    await prisma.activityParticipant.update({
      where: { id: participation.id },
      data: {
        status: newStatus,
        joinedAt: action === 'approve' ? new Date() : null,
        declinedAt: action === 'decline' ? new Date() : null,
        declineReason: action === 'decline' ? reason : null,
      },
    });

    // Update participant count if approved
    if (action === 'approve') {
      await prisma.socialActivity.update({
        where: { id },
        data: { currentParticipants: { increment: 1 } },
      });
    }

    // Notify participant
    await prisma.notification.create({
      data: {
        userId: participantUserId,
        type: action === 'approve' ? 'RSVP_APPROVED' : 'RSVP_DECLINED',
        title: action === 'approve' ? 'RSVP Approved' : 'RSVP Declined',
        message:
          action === 'approve'
            ? `Your request to join "${activity.title}" has been approved!`
            : `Your request to join "${activity.title}" was declined.${reason ? ` Reason: ${reason}` : ''}`,
        data: { activityId: id },
      },
    });

    res.json({
      message: `Participant ${action === 'approve' ? 'approved' : 'declined'} successfully`,
    });
  } catch (error) {
    console.error('Manage participant error:', error);
    res.status(500).json({ error: 'Failed to manage participant' });
  }
}

/**
 * Get activity chat messages
 */
export async function getActivityChat(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { limit = '50', before } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is a participant
    const participation = await prisma.activityParticipant.findUnique({
      where: {
        activityId_userId: { activityId: id, userId },
      },
    });

    const chat = await prisma.activityChat.findUnique({
      where: { activityId: id },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Activity chat not found' });
    }

    if (chat.participantsOnly && (!participation || participation.status !== ParticipantStatus.APPROVED)) {
      return res.status(403).json({ error: 'Only participants can view the chat' });
    }

    const where: any = {
      chatId: chat.id,
      isHidden: false,
    };

    if (before) {
      where.createdAt = { lt: new Date(before as string) };
    }

    const messages = await prisma.activityMessage.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
    });

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get activity chat error:', error);
    res.status(500).json({ error: 'Failed to get activity chat' });
  }
}

/**
 * Send activity chat message
 */
export async function sendActivityMessage(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { content, type = 'TEXT' } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if user is an approved participant
    const participation = await prisma.activityParticipant.findUnique({
      where: {
        activityId_userId: { activityId: id, userId },
      },
    });

    if (!participation || participation.status !== ParticipantStatus.APPROVED) {
      return res.status(403).json({ error: 'Only approved participants can send messages' });
    }

    const chat = await prisma.activityChat.findUnique({
      where: { activityId: id },
    });

    if (!chat || !chat.isEnabled) {
      return res.status(400).json({ error: 'Chat is not available for this activity' });
    }

    const message = await prisma.activityMessage.create({
      data: {
        chatId: chat.id,
        senderId: userId,
        content: content.trim(),
        type,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Emit via Socket.io (if available)
    const io = req.app.get('io');
    if (io) {
      io.to(`activity-${id}`).emit('new-activity-message', message);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send activity message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

/**
 * Get user's activities (created or participating)
 */
export async function getMyActivities(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { type = 'all' } = req.query; // 'created', 'participating', 'all'

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let createdActivities: any[] = [];
    let participatingActivities: any[] = [];

    if (type === 'all' || type === 'created') {
      createdActivities = await prisma.socialActivity.findMany({
        where: { creatorId: userId },
        include: {
          _count: { select: { participants: true } },
        },
        orderBy: { startDate: 'desc' },
      });
    }

    if (type === 'all' || type === 'participating') {
      const participations = await prisma.activityParticipant.findMany({
        where: {
          userId,
          role: { not: ParticipantRole.HOST },
        },
        include: {
          activity: {
            include: {
              creator: {
                select: { id: true, name: true, avatar: true },
              },
              _count: { select: { participants: true } },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
      });

      participatingActivities = participations.map((p) => ({
        ...p.activity,
        participationStatus: p.status,
        joinedAt: p.joinedAt,
      }));
    }

    res.json({
      created: createdActivities,
      participating: participatingActivities,
    });
  } catch (error) {
    console.error('Get my activities error:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
}
