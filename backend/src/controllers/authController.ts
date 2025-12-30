import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { sendEmail } from '../services/email';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = '1h';
const JWT_REFRESH_EXPIRES_IN = '7d';

// Generate tokens
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
  return { accessToken, refreshToken };
};

// Register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone, role = 'TRAVELER' } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role,
        ...(role === 'GUIDE' && {
          guide: {
            create: {},
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate verification token
    const verificationToken = uuidv4();
    // TODO: Store token in Redis with expiry

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verify your LocalLink account',
      template: 'email-verification',
      data: {
        name,
        verificationUrl: `${process.env.APP_URL}/verify-email/${verificationToken}`,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    logger.info(`User registered: ${user.id}`);

    res.status(201).json({
      user,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        guide: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}` });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Prepare response
    const { passwordHash, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.id}`);

    res.json({
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string; role: string };

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id, user.role);

    res.json(tokens);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    next(error);
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  // TODO: Invalidate refresh token in Redis
  res.json({ message: 'Logged out successfully' });
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a password reset email has been sent' });
    }

    // Generate reset token
    const resetToken = uuidv4();
    // TODO: Store token in Redis with 1 hour expiry

    // Send reset email
    await sendEmail({
      to: email,
      subject: 'Reset your LocalLink password',
      template: 'password-reset',
      data: {
        name: user.name,
        resetUrl: `${process.env.APP_URL}/reset-password/${resetToken}`,
      },
    });

    logger.info(`Password reset requested for: ${user.id}`);

    res.json({ message: 'If an account exists, a password reset email has been sent' });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    // TODO: Verify token from Redis
    // For now, this is a placeholder
    const userId = ''; // Get from Redis

    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // TODO: Delete token from Redis

    logger.info(`Password reset completed for: ${userId}`);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    // TODO: Verify token from Redis
    // For now, this is a placeholder
    const userId = ''; // Get from Redis

    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    // TODO: Delete token from Redis

    logger.info(`Email verified for: ${userId}`);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// Resend verification
export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.json({ message: 'If an account exists, a verification email has been sent' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    // TODO: Store token in Redis with expiry

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Verify your LocalLink account',
      template: 'email-verification',
      data: {
        name: user.name,
        verificationUrl: `${process.env.APP_URL}/verify-email/${verificationToken}`,
      },
    });

    res.json({ message: 'If an account exists, a verification email has been sent' });
  } catch (error) {
    next(error);
  }
};
