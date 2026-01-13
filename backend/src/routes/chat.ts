import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
  getOrCreatePrivateConversation,
  getOrCreateCityRoom,
  getOrCreateCountryRoom,
  joinRoom,
  leaveRoom,
  sendMessage,
  getMessages,
  getUserConversations,
  getAvailableCityRooms,
  getAvailableCountryRooms,
  canAccessConversation,
  reportMessage,
  markAsRead,
} from '../services/chatService';
import { hasFeatureAccess } from '../middleware/premiumGate';

const router = Router();

/**
 * GET /api/chat/conversations
 * Get user's conversations
 */
router.get('/conversations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const conversations = await getUserConversations(userId);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

/**
 * POST /api/chat/private/:userId
 * Start or get private conversation with a user
 */
router.post('/private/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const { userId: otherUserId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (currentUserId === otherUserId) {
      return res.status(400).json({ error: 'Cannot start conversation with yourself' });
    }

    // Check if user has premium access for private messaging
    const canChat = await hasFeatureAccess(currentUserId, 'CHAT_MATCHES');
    if (!canChat) {
      return res.status(403).json({
        error: 'Premium feature required',
        message: 'Private messaging requires a Basic subscription',
        upgradeUrl: '/subscription',
      });
    }

    const { conversation, isNew } = await getOrCreatePrivateConversation(
      currentUserId,
      otherUserId
    );

    res.json({
      conversation,
      isNew,
    });
  } catch (error) {
    console.error('Start private conversation error:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

/**
 * GET /api/chat/rooms/cities
 * Get available city rooms
 */
router.get('/rooms/cities', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { country } = req.query;

    const rooms = await getAvailableCityRooms(country as string);

    res.json({ rooms });
  } catch (error) {
    console.error('Get city rooms error:', error);
    res.status(500).json({ error: 'Failed to get city rooms' });
  }
});

/**
 * GET /api/chat/rooms/countries
 * Get available country rooms
 */
router.get('/rooms/countries', optionalAuth, async (req: Request, res: Response) => {
  try {
    const rooms = await getAvailableCountryRooms();

    res.json({ rooms });
  } catch (error) {
    console.error('Get country rooms error:', error);
    res.status(500).json({ error: 'Failed to get country rooms' });
  }
});

/**
 * POST /api/chat/rooms/city
 * Join or create a city room
 */
router.post('/rooms/city', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { city, country } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!city || !country) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['city', 'country'],
      });
    }

    const room = await getOrCreateCityRoom(city, country);
    await joinRoom(room.id, userId);

    res.json({ room });
  } catch (error) {
    console.error('Join city room error:', error);
    res.status(500).json({ error: 'Failed to join city room' });
  }
});

/**
 * POST /api/chat/rooms/country
 * Join or create a country room
 */
router.post('/rooms/country', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { country } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!country) {
      return res.status(400).json({ error: 'Country is required' });
    }

    const room = await getOrCreateCountryRoom(country);
    await joinRoom(room.id, userId);

    res.json({ room });
  } catch (error) {
    console.error('Join country room error:', error);
    res.status(500).json({ error: 'Failed to join country room' });
  }
});

/**
 * DELETE /api/chat/rooms/:conversationId/leave
 * Leave a public room
 */
router.delete('/rooms/:conversationId/leave', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await leaveRoom(conversationId, userId);

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

/**
 * GET /api/chat/:conversationId/messages
 * Get messages from a conversation
 */
router.get('/:conversationId/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { limit = '50', before } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check access
    const access = await canAccessConversation(userId, conversationId);
    if (!access.allowed) {
      return res.status(403).json({ error: access.reason });
    }

    const messages = await getMessages(conversationId, {
      limit: parseInt(limit as string),
      before: before ? new Date(before as string) : undefined,
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * POST /api/chat/:conversationId/messages
 * Send a message to a conversation
 */
router.post('/:conversationId/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { content, type } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check access
    const access = await canAccessConversation(userId, conversationId);
    if (!access.allowed) {
      return res.status(403).json({ error: access.reason });
    }

    const message = await sendMessage({
      conversationId,
      senderId: userId,
      content: content.trim(),
      type: type || 'TEXT',
    });

    // Emit via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${conversationId}`).emit('new-message', message);
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * POST /api/chat/:conversationId/read
 * Mark messages as read
 */
router.post('/:conversationId/read', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await markAsRead(conversationId, userId);

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

/**
 * POST /api/chat/messages/:messageId/report
 * Report a message
 */
router.post('/messages/:messageId/report', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;
    const { reason, details } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const report = await reportMessage(messageId, userId, reason, details);

    res.json({
      message: 'Report submitted. Our team will review it.',
      reportId: report.id,
    });
  } catch (error) {
    console.error('Report message error:', error);
    res.status(500).json({ error: 'Failed to report message' });
  }
});

export default router;
