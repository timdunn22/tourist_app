import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import experienceRoutes from './routes/experiences';
import bookingRoutes from './routes/bookings';
import guideRoutes from './routes/guides';
import reviewRoutes from './routes/reviews';
import messageRoutes from './routes/messages';
import stayRoutes from './routes/stays';
import serviceRoutes from './routes/services';
import categoryRoutes from './routes/categories';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';
import safetyRoutes from './routes/safety';
import oauthRoutes from './routes/oauth';
import onboardingRoutes from './routes/onboarding';
import verificationRoutes from './routes/verification';
import matchingRoutes from './routes/matching';
import activitiesRoutes from './routes/activities';
import mapRoutes from './routes/map';
import chatRoutes from './routes/chat';
import subscriptionRoutes from './routes/subscription';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) },
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Webhook routes (before body parsing for Stripe)
app.use('/webhooks', webhookRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/stays', stayRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Static file serving for uploads (development)
app.use('/uploads', express.static('uploads'));

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join user's personal room for notifications
  socket.on('authenticate', (userId: string) => {
    socket.join(`user:${userId}`);
    logger.info(`Socket ${socket.id} authenticated as user ${userId}`);
  });

  // Join chat room
  socket.on('join-chat', (conversationId: string) => {
    socket.join(`chat:${conversationId}`);
    logger.info(`Socket ${socket.id} joined chat ${conversationId}`);
  });

  // Leave chat room
  socket.on('leave-chat', (conversationId: string) => {
    socket.leave(`chat:${conversationId}`);
  });

  // Join activity room
  socket.on('join-activity', (activityId: string) => {
    socket.join(`activity:${activityId}`);
    logger.info(`Socket ${socket.id} joined activity ${activityId}`);
  });

  // Leave activity room
  socket.on('leave-activity', (activityId: string) => {
    socket.leave(`activity:${activityId}`);
  });

  // Legacy room support
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    logger.info(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
  });

  // Typing indicator
  socket.on('typing', (data: { conversationId: string; userId: string }) => {
    socket.to(`chat:${data.conversationId}`).emit('user-typing', {
      conversationId: data.conversationId,
      userId: data.userId,
    });
  });

  // Stop typing indicator
  socket.on('stop-typing', (data: { conversationId: string; userId: string }) => {
    socket.to(`chat:${data.conversationId}`).emit('user-stop-typing', {
      conversationId: data.conversationId,
      userId: data.userId,
    });
  });

  // Send message (for real-time updates)
  socket.on('send-message', (data) => {
    if (data.conversationId) {
      io.to(`chat:${data.conversationId}`).emit('new-message', data);
    }
  });

  // Location update
  socket.on('location-update', (data) => {
    io.to(`booking-${data.bookingId}`).emit('location-updated', data);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 API docs available at http://localhost:${PORT}/api/docs`);
});

export { app, io };
