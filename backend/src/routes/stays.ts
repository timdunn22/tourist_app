import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all stays
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      city,
      type,
      minPrice,
      maxPrice,
      guests,
      limit = '20',
      offset = '0'
    } = req.query;

    const where: any = {
      status: 'PUBLISHED'
    };

    if (city) where.city = city;
    if (type) where.type = type;
    if (guests) where.maxGuests = { gte: parseInt(guests as string) };

    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice as string);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice as string);
    }

    const [stays, total] = await Promise.all([
      prisma.stay.findMany({
        where,
        orderBy: { rating: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.stay.count({ where })
    ]);

    res.json({ stays, total });
  } catch (error) {
    console.error('Error fetching stays:', error);
    res.status(500).json({ error: 'Failed to fetch stays' });
  }
});

// Get single stay
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    const stay = await prisma.stay.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ],
        status: 'PUBLISHED'
      }
    });

    if (!stay) {
      return res.status(404).json({ error: 'Stay not found' });
    }

    res.json(stay);
  } catch (error) {
    console.error('Error fetching stay:', error);
    res.status(500).json({ error: 'Failed to fetch stay' });
  }
});

export default router;
