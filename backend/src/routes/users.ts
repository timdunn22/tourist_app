import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        bio: true,
        location: true,
        languages: true,
        emailVerified: true,
        phoneVerified: true,
        verificationLevel: true,
        onboardingCompleted: true,
        tripsCompleted: true,
        countriesVisited: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update current user profile
router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, bio, location, languages, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(languages && { languages }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        bio: true,
        location: true,
        languages: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get public user profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        languages: true,
        verificationLevel: true,
        tripsCompleted: true,
        countriesVisited: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user's saved experiences
router.get('/me/saved', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const saved = await prisma.savedExperience.findMany({
      where: { userId },
      include: {
        experience: {
          include: {
            guide: {
              include: {
                user: { select: { id: true, name: true, avatar: true } }
              }
            },
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(saved.map(s => s.experience));
  } catch (error) {
    console.error('Error fetching saved experiences:', error);
    res.status(500).json({ error: 'Failed to fetch saved experiences' });
  }
});

// Save/unsave experience
router.post('/me/saved/:experienceId', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { experienceId } = req.params;

    const existing = await prisma.savedExperience.findUnique({
      where: {
        userId_experienceId: { userId, experienceId }
      }
    });

    if (existing) {
      await prisma.savedExperience.delete({
        where: { id: existing.id }
      });
      res.json({ saved: false });
    } else {
      await prisma.savedExperience.create({
        data: { userId, experienceId }
      });
      res.json({ saved: true });
    }
  } catch (error) {
    console.error('Error toggling saved experience:', error);
    res.status(500).json({ error: 'Failed to toggle saved experience' });
  }
});

export default router;
