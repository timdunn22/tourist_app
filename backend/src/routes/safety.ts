import { Router, Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const router = Router();

// ==================== PANIC ALERTS ====================

// Trigger panic alert (authenticated users only)
router.post(
  '/panic',
  authMiddleware,
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('type').isIn(['EMERGENCY', 'UNCOMFORTABLE', 'MEDICAL', 'LOST', 'SCAM', 'OTHER']),
    body('message').optional().isString(),
    body('bookingId').optional().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude, type, message, bookingId, accuracy } = req.body;
      const userId = (req as any).user.id;

      const alert = await prisma.panicAlert.create({
        data: {
          userId,
          bookingId,
          latitude,
          longitude,
          accuracy,
          type,
          message,
        },
      });

      // Get socket.io instance for real-time notification
      const io = req.app.get('io');
      if (io) {
        io.emit('panic-alert', {
          alertId: alert.id,
          userId,
          type,
          latitude,
          longitude,
          createdAt: alert.createdAt,
        });
      }

      // TODO: Send notifications to emergency contacts
      // TODO: Notify admin dashboard
      // TODO: Send SMS to trusted contacts

      logger.warn(`PANIC ALERT triggered by user ${userId}: ${type}`);

      res.status(201).json({
        success: true,
        alertId: alert.id,
        message: 'Panic alert received. Help is on the way.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's panic alert history
router.get('/panic/history', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;

    const alerts = await prisma.panicAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(alerts);
  } catch (error) {
    next(error);
  }
});

// Update panic alert status (resolve, etc.)
router.put(
  '/panic/:id/resolve',
  authMiddleware,
  [body('resolution').isString()],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resolution } = req.body;
      const userId = (req as any).user.id;

      const alert = await prisma.panicAlert.update({
        where: { id: req.params.id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolvedBy: userId,
          resolution,
        },
      });

      res.json({ success: true, alert });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== SAFETY ZONES ====================

// Get safety zones for a location
router.get('/zones', async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    // For now, get all active zones
    // TODO: Implement geo-query for zones within radius
    const zones = await prisma.safetyZone.findMany({
      where: {
        active: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        coordinates: true,
        radius: true,
        alertTitle: true,
        alertMessage: true,
        severity: true,
      },
    });

    res.json(zones);
  } catch (error) {
    next(error);
  }
});

// Check if a point is in any safety zone
router.post(
  '/zones/check',
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude } = req.body;

      const zones = await prisma.safetyZone.findMany({
        where: { active: true },
      });

      // Simple point-in-circle check for zones with radius
      // TODO: Implement proper polygon containment check
      const matchingZones = zones.filter((zone) => {
        if (zone.radius) {
          const coords = zone.coordinates as any;
          if (coords.lat && coords.lng) {
            const distance = getDistanceFromLatLonInMeters(
              latitude,
              longitude,
              coords.lat,
              coords.lng
            );
            return distance <= zone.radius;
          }
        }
        return false;
      });

      res.json({
        inSafetyZone: matchingZones.length > 0,
        zones: matchingZones.map((z) => ({
          id: z.id,
          name: z.name,
          type: z.type,
          severity: z.severity,
          alertTitle: z.alertTitle,
          alertMessage: z.alertMessage,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== INCIDENT REPORTS ====================

// Submit an incident report
router.post(
  '/incidents',
  authMiddleware,
  [
    body('type').isIn([
      'SAFETY_CONCERN',
      'HARASSMENT',
      'SCAM',
      'THEFT',
      'MEDICAL',
      'GUIDE_MISCONDUCT',
      'SERVICE_ISSUE',
      'OTHER',
    ]),
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('bookingId').optional().isString(),
    body('guideId').optional().isString(),
    body('latitude').optional().isFloat(),
    body('longitude').optional().isFloat(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const {
        type,
        title,
        description,
        bookingId,
        guideId,
        latitude,
        longitude,
        locationDescription,
        images,
        severity,
      } = req.body;

      const report = await prisma.incidentReport.create({
        data: {
          reporterId: userId,
          type,
          title,
          description,
          bookingId,
          guideId,
          latitude,
          longitude,
          locationDescription,
          images: images || [],
          severity: severity || 'CAUTION',
        },
      });

      logger.info(`Incident report created: ${report.id} by user ${userId}`);

      res.status(201).json({
        success: true,
        reportId: report.id,
        message: 'Your report has been submitted. We will review it shortly.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's incident reports
router.get('/incidents', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;

    const reports = await prisma.incidentReport.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    next(error);
  }
});

// ==================== CHECK-INS ====================

// Create a check-in
router.post(
  '/checkin',
  authMiddleware,
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('type').isIn(['MANUAL', 'BOOKING_START', 'BOOKING_END', 'SCHEDULED', 'AUTO']),
    body('note').optional().isString(),
    body('bookingId').optional().isString(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { latitude, longitude, type, note, bookingId, expectedNextCheckIn, alertIfMissed } =
        req.body;

      const checkIn = await prisma.checkIn.create({
        data: {
          userId,
          latitude,
          longitude,
          type,
          note,
          bookingId,
          expectedNextCheckIn: expectedNextCheckIn ? new Date(expectedNextCheckIn) : null,
          alertIfMissed: alertIfMissed || false,
        },
      });

      res.status(201).json({
        success: true,
        checkInId: checkIn.id,
        message: 'Check-in recorded',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's check-in history
router.get('/checkin/history', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 20 } = req.query;

    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    });

    res.json(checkIns);
  } catch (error) {
    next(error);
  }
});

// ==================== TRUSTED CONTACTS ====================

// Get user's trusted contacts
router.get('/contacts', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;

    const contacts = await prisma.trustedContact.findMany({
      where: { userId },
    });

    res.json(contacts);
  } catch (error) {
    next(error);
  }
});

// Add trusted contact
router.post(
  '/contacts',
  authMiddleware,
  [
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('email').optional().isEmail(),
    body('relationship').trim().notEmpty(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { name, phone, email, relationship, notifyOnPanic, notifyOnCheckIn } = req.body;

      const contact = await prisma.trustedContact.create({
        data: {
          userId,
          name,
          phone,
          email,
          relationship,
          notifyOnPanic: notifyOnPanic !== false,
          notifyOnCheckIn: notifyOnCheckIn || false,
        },
      });

      res.status(201).json(contact);
    } catch (error) {
      next(error);
    }
  }
);

// Update trusted contact
router.put(
  '/contacts/:id',
  authMiddleware,
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
  ],
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;

      // Verify ownership
      const existing = await prisma.trustedContact.findFirst({
        where: { id: req.params.id, userId },
      });

      if (!existing) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      const contact = await prisma.trustedContact.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(contact);
    } catch (error) {
      next(error);
    }
  }
);

// Delete trusted contact
router.delete('/contacts/:id', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;

    // Verify ownership
    const existing = await prisma.trustedContact.findFirst({
      where: { id: req.params.id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await prisma.trustedContact.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    next(error);
  }
});

// ==================== HELPERS ====================

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in meters
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default router;
