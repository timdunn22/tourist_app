import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

// Generate tokens
const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId, role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Find or create user from OAuth data
const findOrCreateOAuthUser = async (
  provider: string,
  providerId: string,
  email: string,
  name: string,
  avatar?: string
) => {
  // First, try to find by provider ID
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { googleId: provider === 'google' ? providerId : undefined },
        { facebookId: provider === 'facebook' ? providerId : undefined },
        { email },
      ],
    },
  });

  if (user) {
    // Update provider ID if not set
    const updateData: any = {};
    if (provider === 'google' && !user.googleId) {
      updateData.googleId = providerId;
    }
    if (provider === 'facebook' && !user.facebookId) {
      updateData.facebookId = providerId;
    }
    if (avatar && !user.avatar) {
      updateData.avatar = avatar;
    }
    if (!user.emailVerified) {
      updateData.emailVerified = true;
    }

    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }
  } else {
    // Create new user
    user = await prisma.user.create({
      data: {
        email,
        name,
        avatar,
        role: 'TRAVELER',
        status: 'ACTIVE',
        emailVerified: true,
        passwordHash: '', // No password for OAuth users
        ...(provider === 'google' && { googleId: providerId }),
        ...(provider === 'facebook' && { facebookId: providerId }),
      },
    });
  }

  return user;
};

// Google OAuth
export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;

    // Decode the JWT credential from Google (in production, verify with Google's public keys)
    // For development, we'll decode without verification
    const decoded = jwt.decode(credential) as any;

    if (!decoded || !decoded.email) {
      return res.status(400).json({ error: 'Invalid Google credential' });
    }

    const { sub: googleId, email, name, picture } = decoded;

    // Find or create user
    const user = await findOrCreateOAuthUser('google', googleId, email, name, picture);

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

    // Prepare response (exclude sensitive fields)
    const { passwordHash, ...userWithoutPassword } = user;

    logger.info(`Google OAuth login: ${user.id}`);

    res.json({
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error) {
    logger.error('Google OAuth error:', error);
    next(error);
  }
};

// Facebook OAuth
export const facebookAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.body;

    // Verify token with Facebook Graph API
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );

    if (!response.ok) {
      return res.status(400).json({ error: 'Invalid Facebook token' });
    }

    const fbData = await response.json() as {
      id: string;
      email?: string;
      name: string;
      picture?: { data?: { url?: string } };
    };

    if (!fbData.email) {
      return res.status(400).json({ error: 'Email permission required' });
    }

    const { id: facebookId, email, name, picture } = fbData;
    const avatar = picture?.data?.url;

    // Find or create user
    const user = await findOrCreateOAuthUser('facebook', facebookId, email, name, avatar);

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

    logger.info(`Facebook OAuth login: ${user.id}`);

    res.json({
      user: userWithoutPassword,
      ...tokens,
    });
  } catch (error) {
    logger.error('Facebook OAuth error:', error);
    next(error);
  }
};
