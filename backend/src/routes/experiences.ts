import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all experiences (public)
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      city,
      category,
      minPrice,
      maxPrice,
      difficulty,
      search,
      featured,
      limit = '20',
      offset = '0'
    } = req.query;

    const where: any = {
      status: 'PUBLISHED'
    };

    if (city) where.city = city;
    if (category) where.categoryId = category;
    if (difficulty) where.difficulty = difficulty;
    if (featured === 'true') where.featured = true;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } }
      ];
    }

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        include: {
          guide: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          },
          category: true
        },
        orderBy: [
          { featured: 'desc' },
          { rating: 'desc' }
        ],
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.experience.count({ where })
    ]);

    res.json({ experiences, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Get single experience by ID or slug
router.get('/:idOrSlug', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    const experience = await prisma.experience.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ],
        status: 'PUBLISHED'
      },
      include: {
        guide: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, bio: true, languages: true }
            }
          }
        },
        category: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    });

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Increment view count
    await prisma.experience.update({
      where: { id: experience.id },
      data: { viewCount: { increment: 1 } }
    });

    res.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

// Get experiences by guide
router.get('/guide/:guideId', async (req: Request, res: Response) => {
  try {
    const { guideId } = req.params;

    const experiences = await prisma.experience.findMany({
      where: {
        guideId,
        status: 'PUBLISHED'
      },
      include: {
        category: true
      },
      orderBy: { rating: 'desc' }
    });

    res.json(experiences);
  } catch (error) {
    console.error('Error fetching guide experiences:', error);
    res.status(500).json({ error: 'Failed to fetch experiences' });
  }
});

// Get featured experiences
router.get('/featured/list', async (req: Request, res: Response) => {
  try {
    const experiences = await prisma.experience.findMany({
      where: {
        featured: true,
        status: 'PUBLISHED'
      },
      include: {
        guide: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        },
        category: true
      },
      take: 10,
      orderBy: { rating: 'desc' }
    });

    res.json(experiences);
  } catch (error) {
    console.error('Error fetching featured experiences:', error);
    res.status(500).json({ error: 'Failed to fetch featured experiences' });
  }
});

export default router;
