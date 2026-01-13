import { PrismaClient, ConversationType } from '@prisma/client';
import { hasFeatureAccess } from '../middleware/premiumGate';

const prisma = new PrismaClient();

interface MessageData {
  conversationId: string;
  senderId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM';
}

/**
 * Get or create a private conversation between two users
 */
export async function getOrCreatePrivateConversation(
  userId1: string,
  userId2: string
): Promise<{ conversation: any; isNew: boolean }> {
  // Check if conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      type: ConversationType.PRIVATE,
      participants: {
        every: {
          userId: { in: [userId1, userId2] },
        },
      },
    },
    include: {
      participants: {
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
    },
  });

  if (existing) {
    return { conversation: existing, isNew: false };
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: ConversationType.PRIVATE,
      participants: {
        create: [
          { userId: userId1 },
          { userId: userId2 },
        ],
      },
    },
    include: {
      participants: {
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
    },
  });

  return { conversation, isNew: true };
}

/**
 * Get or create a city chat room
 */
export async function getOrCreateCityRoom(
  city: string,
  country: string
): Promise<any> {
  const roomId = `city:${country.toLowerCase()}:${city.toLowerCase()}`;
  const roomName = `${city}, ${country}`;

  let conversation = await prisma.conversation.findFirst({
    where: {
      type: ConversationType.CITY_ROOM,
      roomId,
    },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        type: ConversationType.CITY_ROOM,
        roomId,
        roomName,
        isModerated: true,
      },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });
  }

  return conversation;
}

/**
 * Get or create a country chat room
 */
export async function getOrCreateCountryRoom(country: string): Promise<any> {
  const roomId = `country:${country.toLowerCase()}`;
  const roomName = country;

  let conversation = await prisma.conversation.findFirst({
    where: {
      type: ConversationType.COUNTRY_ROOM,
      roomId,
    },
    include: {
      _count: {
        select: { participants: true },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        type: ConversationType.COUNTRY_ROOM,
        roomId,
        roomName,
        isModerated: true,
      },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });
  }

  return conversation;
}

/**
 * Join a public room
 */
export async function joinRoom(
  conversationId: string,
  userId: string
): Promise<void> {
  // Check if already a participant
  const existing = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId },
  });

  if (!existing) {
    await prisma.conversationParticipant.create({
      data: { conversationId, userId },
    });
  }
}

/**
 * Leave a public room
 */
export async function leaveRoom(
  conversationId: string,
  userId: string
): Promise<void> {
  await prisma.conversationParticipant.deleteMany({
    where: { conversationId, userId },
  });
}

/**
 * Send a message to a conversation
 */
export async function sendMessage(data: MessageData): Promise<any> {
  const message = await prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      type: data.type || 'TEXT',
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
          verificationLevel: true,
        },
      },
    },
  });

  // Update participant's lastReadAt
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: data.conversationId,
      userId: data.senderId,
    },
    data: { lastReadAt: new Date() },
  });

  return message;
}

/**
 * Get messages from a conversation
 */
export async function getMessages(
  conversationId: string,
  options: { limit?: number; before?: Date } = {}
): Promise<any[]> {
  const { limit = 50, before } = options;

  const where: any = {
    conversationId,
    isHidden: false,
  };

  if (before) {
    where.createdAt = { lt: before };
  }

  const messages = await prisma.message.findMany({
    where,
    include: {
      sender: {
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
  });

  return messages.reverse();
}

/**
 * Get user's conversations
 */
export async function getUserConversations(userId: string): Promise<any[]> {
  const participations = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: {
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
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
    orderBy: {
      lastReadAt: 'desc',
    },
  });

  return participations.map((p) => ({
    ...p.conversation,
    lastReadAt: p.lastReadAt,
  }));
}

/**
 * Get available city rooms
 */
export async function getAvailableCityRooms(
  country?: string
): Promise<any[]> {
  const where: any = {
    type: ConversationType.CITY_ROOM,
  };

  if (country) {
    where.roomId = { startsWith: `city:${country.toLowerCase()}:` };
  }

  const rooms = await prisma.conversation.findMany({
    where,
    include: {
      _count: {
        select: { participants: true },
      },
    },
    orderBy: {
      participants: {
        _count: 'desc',
      },
    },
    take: 50,
  });

  return rooms;
}

/**
 * Get available country rooms
 */
export async function getAvailableCountryRooms(): Promise<any[]> {
  const rooms = await prisma.conversation.findMany({
    where: {
      type: ConversationType.COUNTRY_ROOM,
    },
    include: {
      _count: {
        select: { participants: true },
      },
    },
    orderBy: {
      participants: {
        _count: 'desc',
      },
    },
    take: 50,
  });

  return rooms;
}

/**
 * Check if user can access a conversation
 */
export async function canAccessConversation(
  userId: string,
  conversationId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: true,
    },
  });

  if (!conversation) {
    return { allowed: false, reason: 'Conversation not found' };
  }

  // Public rooms are open to all
  if (
    conversation.type === ConversationType.CITY_ROOM ||
    conversation.type === ConversationType.COUNTRY_ROOM
  ) {
    return { allowed: true };
  }

  // Check if user is a participant
  const isParticipant = conversation.participants.some((p) => p.userId === userId);

  if (!isParticipant) {
    return { allowed: false, reason: 'Not a participant' };
  }

  // For private chats, check premium access
  if (conversation.type === ConversationType.PRIVATE) {
    const canChat = await hasFeatureAccess(userId, 'CHAT_MATCHES');
    if (!canChat) {
      return {
        allowed: false,
        reason: 'Private messaging requires a Basic subscription',
      };
    }
  }

  return { allowed: true };
}

/**
 * Report a message
 */
export async function reportMessage(
  messageId: string,
  reporterId: string,
  reason: string,
  details?: string
): Promise<any> {
  const report = await prisma.messageReport.create({
    data: {
      messageId,
      reporterId,
      reason: reason as any,
      details,
    },
  });

  return report;
}

/**
 * Mark messages as read
 */
export async function markAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: new Date() },
  });
}
