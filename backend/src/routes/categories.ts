import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const { active = 'true' } = req.query;

    const where: any = {};
    if (active === 'true') where.active = true;

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          where: active === 'true' ? { active: true } : {},
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: { experiences: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Filter to only root categories (no parent)
    const rootCategories = categories.filter(c => !c.parentId);

    res.json(rootCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        children: true,
        experiences: {
          where: { status: 'PUBLISHED' },
          take: 10,
          include: {
            guide: {
              include: {
                user: { select: { id: true, name: true, avatar: true } }
              }
            }
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

export default router;
