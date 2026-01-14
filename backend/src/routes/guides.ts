import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all guides (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      city,
      verified,
      level,
      specialty,
      minRating,
      limit = '20',
      offset = '0'
    } = req.query;

    const where: any = {};

    if (verified === 'true') where.verified = true;
    if (level) where.level = level;
    if (specialty) where.specialties = { has: specialty as string };
    if (minRating) where.rating = { gte: parseFloat(minRating as string) };

    // Filter by city through user relation
    if (city) {
      where.user = { location: { contains: city as string, mode: 'insensitive' } };
    }

    const [guides, total] = await Promise.all([
      prisma.guide.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              bio: true,
              location: true,
              languages: true
            }
          },
          experiences: {
            where: { status: 'PUBLISHED' },
            take: 3,
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
              price: true,
              rating: true
            }
          }
        },
        orderBy: [
          { verified: 'desc' },
          { rating: 'desc' }
        ],
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.guide.count({ where })
    ]);

    res.json({ guides, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ error: 'Failed to fetch guides' });
  }
});

// Get single guide by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            location: true,
            languages: true,
            createdAt: true
          }
        },
        experiences: {
          where: { status: 'PUBLISHED' },
          include: {
            category: true
          },
          orderBy: { rating: 'desc' }
        }
      }
    });

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json(guide);
  } catch (error) {
    console.error('Error fetching guide:', error);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
});

// Get guide by user ID
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const guide = await prisma.guide.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            location: true,
            languages: true,
            createdAt: true
          }
        },
        experiences: {
          where: { status: 'PUBLISHED' },
          include: {
            category: true
          }
        }
      }
    });

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json(guide);
  } catch (error) {
    console.error('Error fetching guide:', error);
    res.status(500).json({ error: 'Failed to fetch guide' });
  }
});

// Get top rated guides
router.get('/top/rated', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const guides = await prisma.guide.findMany({
      where: {
        verified: true,
        rating: { gte: 4.0 }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            location: true
          }
        }
      },
      orderBy: { rating: 'desc' },
      take: parseInt(limit as string)
    });

    res.json(guides);
  } catch (error) {
    console.error('Error fetching top guides:', error);
    res.status(500).json({ error: 'Failed to fetch top guides' });
  }
});

export default router;
