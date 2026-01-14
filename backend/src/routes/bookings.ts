import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

// Get user's bookings
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, limit = '20', offset = '0' } = req.query;

    const where: any = { travelerId: userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          experience: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
              meetingPoint: true,
              duration: true
            }
          },
          guide: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.booking.count({ where })
    ]);

    res.json({ bookings, total });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        OR: [
          { travelerId: userId },
          { guide: { userId } }
        ]
      },
      include: {
        experience: true,
        guide: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, phone: true }
            }
          }
        },
        traveler: {
          select: { id: true, name: true, avatar: true, phone: true }
        },
        review: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create booking
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { experienceId, date, startTime, guestCount, specialRequests } = req.body;

    // Get experience details
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      include: { guide: true }
    });

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    if (experience.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Experience is not available for booking' });
    }

    // Check guest count
    if (guestCount < experience.groupSizeMin || guestCount > experience.groupSizeMax) {
      return res.status(400).json({
        error: `Guest count must be between ${experience.groupSizeMin} and ${experience.groupSizeMax}`
      });
    }

    // Calculate pricing
    const basePrice = Number(experience.price) * guestCount;
    const serviceFee = 5.00 * guestCount;
    const totalPrice = basePrice + serviceFee;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: `BK-${uuidv4().slice(0, 8).toUpperCase()}`,
        travelerId: userId,
        guideId: experience.guideId,
        experienceId,
        date: new Date(date),
        startTime,
        guestCount,
        specialRequests,
        basePrice,
        serviceFee,
        totalPrice,
        currency: experience.currency,
        status: 'PENDING'
      },
      include: {
        experience: {
          select: { id: true, title: true, images: true }
        },
        guide: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    // Update experience booking count
    await prisma.experience.update({
      where: { id: experienceId },
      data: { bookingCount: { increment: 1 } }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Cancel booking
router.post('/:id/cancel', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        travelerId: userId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or cannot be cancelled' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledBy: userId,
        cancellationReason: reason
      }
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Confirm booking (for guides)
router.post('/:id/confirm', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        guide: { userId },
        status: 'PENDING'
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or cannot be confirmed' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' }
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
});

export default router;
