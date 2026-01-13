import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

// ==================== DASHBOARD ====================

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalGuides,
      totalExperiences,
      totalBookings,
      revenue,
      pendingApprovals,
      activeBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.guide.count(),
      prisma.experience.count({ where: { status: 'PUBLISHED' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { totalPrice: true },
      }),
      prisma.experience.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          traveler: { select: { name: true, avatar: true } },
          experience: { select: { title: true } },
        },
      }),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalGuides,
        totalExperiences,
        totalBookings,
        totalRevenue: revenue._sum.totalPrice || 0,
        pendingApprovals,
        activeBookings,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Bookings by day
    const bookingsByDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count, SUM(total_price) as revenue
      FROM "Booking"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Top experiences
    const topExperiences = await prisma.experience.findMany({
      take: 10,
      orderBy: { bookingCount: 'desc' },
      select: {
        id: true,
        title: true,
        bookingCount: true,
        rating: true,
        guide: { select: { user: { select: { name: true } } } },
      },
    });

    // Top guides
    const topGuides = await prisma.guide.findMany({
      take: 10,
      orderBy: { totalEarnings: 'desc' },
      include: {
        user: { select: { name: true, avatar: true } },
      },
    });

    // User registrations by day
    const usersByDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count, role
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at), role
      ORDER BY date
    `;

    res.json({
      bookingsByDay,
      topExperiences,
      topGuides,
      usersByDay,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [bookings, reviews, newUsers, newGuides] = await Promise.all([
      prisma.booking.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          traveler: { select: { name: true } },
          experience: { select: { title: true } },
        },
      }),
      prisma.review.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          experience: { select: { title: true } },
        },
      }),
      prisma.user.findMany({
        take: 10,
        where: { role: 'TRAVELER' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.guide.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    res.json({ bookings, reviews, newUsers, newGuides });
  } catch (error) {
    next(error);
  }
};

// ==================== USERS ====================

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { bookingsAsTraveler: true, reviews: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        guide: true,
        bookingsAsTraveler: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { experience: { select: { title: true } } },
        },
        reviews: { take: 10 },
        paymentMethods: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, role, bio, location } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, phone, role, bio, location },
      select: { id: true, name: true, email: true, role: true },
    });

    await logAudit(req, 'UPDATE', 'User', user.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
    });

    await logAudit(req, 'STATUS_CHANGE', 'User', user.id, { status, reason });
    res.json({ message: 'User status updated', user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'User', req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== GUIDES ====================

export const getGuides = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, verified, level, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (verified !== undefined) where.verified = verified === 'true';
    if (level) where.level = level;
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ],
      };
    }

    const [guides, total] = await Promise.all([
      prisma.guide.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, status: true } },
          _count: { select: { experiences: true, bookings: true } },
        },
      }),
      prisma.guide.count({ where }),
    ]);

    res.json({
      guides,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guide = await prisma.guide.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        experiences: { take: 20 },
        bookings: { take: 20, orderBy: { createdAt: 'desc' } },
        trainings: { include: { training: true } },
        earnings: { take: 20, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json(guide);
  } catch (error) {
    next(error);
  }
};

export const updateGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialties, badges, availability, trustScore } = req.body;

    const guide = await prisma.guide.update({
      where: { id: req.params.id },
      data: { specialties, badges, availability, trustScore },
    });

    await logAudit(req, 'UPDATE', 'Guide', guide.id, req.body);
    res.json(guide);
  } catch (error) {
    next(error);
  }
};

export const verifyGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { verified, notes } = req.body;

    const guide = await prisma.guide.update({
      where: { id: req.params.id },
      data: {
        verified,
        verifiedAt: verified ? new Date() : null,
      },
    });

    await logAudit(req, 'VERIFY', 'Guide', guide.id, { verified, notes });
    res.json({ message: `Guide ${verified ? 'verified' : 'unverified'}`, guide });
  } catch (error) {
    next(error);
  }
};

export const updateGuideLevel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { level, reason } = req.body;

    const guide = await prisma.guide.update({
      where: { id: req.params.id },
      data: { level },
    });

    await logAudit(req, 'LEVEL_CHANGE', 'Guide', guide.id, { level, reason });
    res.json({ message: 'Guide level updated', guide });
  } catch (error) {
    next(error);
  }
};

// ==================== EXPERIENCES ====================

export const getExperiences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status, category, featured, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (featured !== undefined) where.featured = featured === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { guide: { user: { name: { contains: search as string, mode: 'insensitive' } } } },
      ];
    }

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          guide: { include: { user: { select: { name: true } } } },
          category: { select: { name: true } },
        },
      }),
      prisma.experience.count({ where }),
    ]);

    res.json({
      experiences,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const experience = await prisma.experience.findUnique({
      where: { id: req.params.id },
      include: {
        guide: { include: { user: true } },
        category: true,
        reviews: { take: 10, include: { user: { select: { name: true, avatar: true } } } },
        bookings: { take: 20, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.json(experience);
  } catch (error) {
    next(error);
  }
};

export const updateExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await logAudit(req, 'UPDATE', 'Experience', experience.id, req.body);
    res.json(experience);
  } catch (error) {
    next(error);
  }
};

export const updateExperienceStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;

    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(status === 'PUBLISHED' && { publishedAt: new Date() }),
      },
    });

    await logAudit(req, 'STATUS_CHANGE', 'Experience', experience.id, { status, reason });
    res.json({ message: 'Experience status updated', experience });
  } catch (error) {
    next(error);
  }
};

export const toggleFeatured = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const experience = await prisma.experience.findUnique({ where: { id: req.params.id } });
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    const updated = await prisma.experience.update({
      where: { id: req.params.id },
      data: { featured: !experience.featured },
    });

    await logAudit(req, 'TOGGLE_FEATURED', 'Experience', updated.id, { featured: updated.featured });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteExperience = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.experience.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'Experience', req.params.id);
    res.json({ message: 'Experience deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== BOOKINGS ====================

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          traveler: { select: { name: true, email: true } },
          guide: { include: { user: { select: { name: true } } } },
          experience: { select: { title: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        traveler: true,
        guide: { include: { user: true } },
        experience: true,
        review: true,
        messages: true,
        trackingPoints: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
    });

    await logAudit(req, 'STATUS_CHANGE', 'Booking', booking.id, { status, reason });
    res.json({ message: 'Booking status updated', booking });
  } catch (error) {
    next(error);
  }
};

export const refundBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, reason } = req.body;

    // TODO: Process refund via Stripe

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
    });

    await logAudit(req, 'REFUND', 'Booking', booking.id, { amount, reason });
    res.json({ message: 'Booking refunded', booking });
  } catch (error) {
    next(error);
  }
};

// ==================== REVIEWS ====================

export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status, rating } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (rating) where.overallRating = Number(rating);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          experience: { select: { title: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status },
    });

    await logAudit(req, 'STATUS_CHANGE', 'Review', review.id, { status, reason });
    res.json({ message: 'Review status updated', review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'Review', req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== CATEGORIES ====================

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { experiences: true } }, children: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    await logAudit(req, 'CREATE', 'Category', category.id, req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await logAudit(req, 'UPDATE', 'Category', category.id, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'Category', req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== SERVICES ====================

export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(services);
  } catch (error) {
    next(error);
  }
};

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.create({ data: req.body });
    await logAudit(req, 'CREATE', 'Service', service.id, req.body);
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await logAudit(req, 'UPDATE', 'Service', service.id, req.body);
    res.json(service);
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'Service', req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== STAYS ====================

export const getStays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stays = await prisma.stay.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(stays);
  } catch (error) {
    next(error);
  }
};

export const getStay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stay = await prisma.stay.findUnique({ where: { id: req.params.id } });
    if (!stay) return res.status(404).json({ error: 'Stay not found' });
    res.json(stay);
  } catch (error) {
    next(error);
  }
};

export const updateStay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stay = await prisma.stay.update({ where: { id: req.params.id }, data: req.body });
    await logAudit(req, 'UPDATE', 'Stay', stay.id, req.body);
    res.json(stay);
  } catch (error) {
    next(error);
  }
};

export const updateStayStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const stay = await prisma.stay.update({ where: { id: req.params.id }, data: { status } });
    await logAudit(req, 'STATUS_CHANGE', 'Stay', stay.id, { status });
    res.json(stay);
  } catch (error) {
    next(error);
  }
};

// ==================== TRAINING ====================

export const getTrainingModules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const modules = await prisma.training.findMany({
      include: { _count: { select: { completions: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    res.json(modules);
  } catch (error) {
    next(error);
  }
};

export const createTrainingModule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const training = await prisma.training.create({ data: req.body });
    await logAudit(req, 'CREATE', 'Training', training.id, req.body);
    res.status(201).json(training);
  } catch (error) {
    next(error);
  }
};

export const updateTrainingModule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const training = await prisma.training.update({ where: { id: req.params.id }, data: req.body });
    await logAudit(req, 'UPDATE', 'Training', training.id, req.body);
    res.json(training);
  } catch (error) {
    next(error);
  }
};

export const deleteTrainingModule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.training.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'Training', req.params.id);
    res.json({ message: 'Training module deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== LOCATIONS ====================

export const getLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });
    res.json(locations);
  } catch (error) {
    next(error);
  }
};

export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await prisma.location.create({ data: req.body });
    await logAudit(req, 'CREATE', 'Location', location.id, req.body);
    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = await prisma.location.update({ where: { id: req.params.id }, data: req.body });
    await logAudit(req, 'UPDATE', 'Location', location.id, req.body);
    res.json(location);
  } catch (error) {
    next(error);
  }
};

export const deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    await logAudit(req, 'DELETE', 'Location', req.params.id);
    res.json({ message: 'Location deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== SETTINGS ====================

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsMap);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = Object.entries(req.body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: value as any },
        update: { value: value as any },
      })
    );
    await Promise.all(updates);
    await logAudit(req, 'UPDATE', 'Settings', null, req.body);
    res.json({ message: 'Settings updated' });
  } catch (error) {
    next(error);
  }
};

export const getSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: req.params.key } });
    res.json(setting?.value || null);
  } catch (error) {
    next(error);
  }
};

export const updateSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await prisma.setting.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, value: req.body.value },
      update: { value: req.body.value },
    });
    await logAudit(req, 'UPDATE', 'Setting', setting.id, req.body);
    res.json(setting);
  } catch (error) {
    next(error);
  }
};

// ==================== SUPPORT TICKETS ====================

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

export const getTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await logAudit(req, 'UPDATE', 'SupportTicket', ticket.id, req.body);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

export const replyToTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement ticket reply system
    res.json({ message: 'Reply sent' });
  } catch (error) {
    next(error);
  }
};

// ==================== REPORTS ====================

export const getRevenueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    // TODO: Implement detailed revenue report
    res.json({ message: 'Revenue report' });
  } catch (error) {
    next(error);
  }
};

export const getBookingsReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'Bookings report' });
  } catch (error) {
    next(error);
  }
};

export const getUsersReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'Users report' });
  } catch (error) {
    next(error);
  }
};

export const getGuidesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'Guides report' });
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'Export report' });
  } catch (error) {
    next(error);
  }
};

// ==================== AUDIT LOG ====================

export const getAuditLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, entity, action } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};

// ==================== PAYOUTS ====================

export const getPayouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const earnings = await prisma.earning.findMany({
      where: { status: 'AVAILABLE' },
      include: { guide: { include: { user: { select: { name: true } } } } },
    });
    res.json(earnings);
  } catch (error) {
    next(error);
  }
};

export const processPayouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: Process payouts via Stripe Connect
    res.json({ message: 'Payouts processing' });
  } catch (error) {
    next(error);
  }
};

// ==================== NOTIFICATIONS ====================

export const sendNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, title, message, type } = req.body;
    const notification = await prisma.notification.create({
      data: { userId, title, message, type },
    });
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const broadcastNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, message, type, targetRole } = req.body;

    const users = await prisma.user.findMany({
      where: targetRole ? { role: targetRole } : {},
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: users.map((u) => ({ userId: u.id, title, message, type })),
    });

    res.json({ message: `Notification sent to ${users.length} users` });
  } catch (error) {
    next(error);
  }
};

// ==================== HELPERS ====================

const logAudit = async (req: Request, action: string, entity: string, entityId: string | null, newValue?: any) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: (req as any).user?.id,
        action,
        entity,
        entityId,
        newValue,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};

// ==================== VERIFICATION DOCUMENTS ====================

export const getVerificationDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status = 'PENDING', page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [documents, total] = await Promise.all([
      prisma.verificationDocument.findMany({
        where: { status: status as any },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              verificationLevel: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.verificationDocument.count({ where: { status: status as any } }),
    ]);

    res.json({
      documents,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
};

export const getVerificationStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      prisma.verificationDocument.count({ where: { status: 'PENDING' } }),
      prisma.verificationDocument.count({ where: { status: 'APPROVED' } }),
      prisma.verificationDocument.count({ where: { status: 'REJECTED' } }),
      prisma.verificationDocument.count(),
    ]);

    const byType = await prisma.verificationDocument.groupBy({
      by: ['type'],
      _count: true,
    });

    res.json({
      pending,
      approved,
      rejected,
      total,
      byType,
    });
  } catch (error) {
    next(error);
  }
};

export const getVerificationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await prisma.verificationDocument.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            verificationLevel: true,
            dateOfBirth: true,
            createdAt: true,
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Fetch reviewer separately if exists
    let reviewer = null;
    if (document.reviewedBy) {
      reviewer = await prisma.user.findUnique({
        where: { id: document.reviewedBy },
        select: { id: true, name: true },
      });
    }

    res.json({ ...document, reviewer });
  } catch (error) {
    next(error);
  }
};

export const reviewVerificationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, rejectionReason, adminNotes } = req.body;
    const adminId = (req as any).user?.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const document = await prisma.verificationDocument.update({
      where: { id: req.params.id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes,
      },
      include: { user: true },
    });

    // Update user verification level if approved
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: document.userId },
        data: {
          verificationLevel: 'ID_VERIFIED',
          verifiedAt: new Date(),
        },
      });
    }

    await logAudit(req, 'REVIEW', 'VerificationDocument', document.id, { status, rejectionReason });

    res.json(document);
  } catch (error) {
    next(error);
  }
};

// ==================== CHAT MODERATION ====================

export const getMessageReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status = 'PENDING', page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [reports, total] = await Promise.all([
      prisma.messageReport.findMany({
        where: { status: status as any },
        include: {
          reporter: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.messageReport.count({ where: { status: status as any } }),
    ]);

    // Fetch messages for each report
    const reportsWithMessages = await Promise.all(
      reports.map(async (report) => {
        let message = null;
        if (report.messageId) {
          message = await prisma.message.findUnique({
            where: { id: report.messageId },
            include: {
              sender: { select: { id: true, name: true, avatar: true } },
              conversation: { select: { id: true, type: true, roomName: true } },
            },
          });
        }
        return { ...report, message };
      })
    );

    res.json({
      reports: reportsWithMessages,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
};

export const getMessageReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await prisma.messageReport.findUnique({
      where: { id: req.params.id },
      include: {
        reporter: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Fetch message separately
    let message = null;
    if (report.messageId) {
      message = await prisma.message.findUnique({
        where: { id: report.messageId },
        include: {
          sender: { select: { id: true, name: true, avatar: true, email: true } },
          conversation: true,
        },
      });
    }

    // Fetch reviewer separately
    let reviewer = null;
    if (report.reviewedBy) {
      reviewer = await prisma.user.findUnique({
        where: { id: report.reviewedBy },
        select: { id: true, name: true },
      });
    }

    res.json({ ...report, message, reviewer });
  } catch (error) {
    next(error);
  }
};

export const moderateMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { action } = req.body;
    const adminId = (req as any).user?.id;

    const message = await prisma.message.findUnique({
      where: { id: req.params.id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Update message based on action - just delete for now since no isHidden field
    if (action === 'HIDE' || action === 'DELETE') {
      await prisma.message.delete({ where: { id: req.params.id } });
    }

    // Update any related reports
    await prisma.messageReport.updateMany({
      where: { messageId: req.params.id },
      data: {
        status: 'ACTIONED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        action,
      },
    });

    await logAudit(req, 'MODERATE', 'Message', req.params.id, { action });

    res.json({ message: 'Message moderated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// ==================== SUBSCRIPTION ANALYTICS ====================

export const getSubscriptionAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [tierCounts, statusCounts, recentSubscriptions, mrr] = await Promise.all([
      prisma.subscription.groupBy({
        by: ['tier'],
        _count: true,
      }),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.subscription.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Calculate MRR
      prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          tier: { not: 'FREE' },
        },
        select: { tier: true },
      }),
    ]);

    // Calculate MRR based on tier prices
    const tierPrices: Record<string, number> = {
      BASIC: 9.99,
      PREMIUM: 19.99,
      BUSINESS: 49.99,
    };

    const mrrTotal = mrr.reduce((sum, sub) => sum + (tierPrices[sub.tier] || 0), 0);

    res.json({
      tierCounts,
      statusCounts,
      recentSubscriptions,
      mrr: mrrTotal,
      activeSubscribers: mrr.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getMatchingAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalMatches, mutualMatches, statusCounts, recentMatches] = await Promise.all([
      prisma.userMatch.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.userMatch.count({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['MUTUAL_INTEREST', 'CONNECTED'] },
        },
      }),
      prisma.userMatch.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.userMatch.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          matchedUser: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    res.json({
      totalMatches,
      mutualMatches,
      matchRate: totalMatches > 0 ? (mutualMatches / totalMatches * 100).toFixed(1) : 0,
      statusCounts,
      recentMatches,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalActivities, activeActivities, typeCounts, popularActivities] = await Promise.all([
      prisma.socialActivity.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.socialActivity.count({
        where: { status: 'ACTIVE' },
      }),
      prisma.socialActivity.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.socialActivity.findMany({
        orderBy: { currentParticipants: 'desc' },
        take: 10,
        include: {
          creator: { select: { id: true, name: true, avatar: true } },
          _count: { select: { participants: true } },
        },
      }),
    ]);

    const avgParticipants = await prisma.socialActivity.aggregate({
      where: { status: 'ACTIVE' },
      _avg: { currentParticipants: true },
    });

    res.json({
      totalActivities,
      activeActivities,
      avgParticipants: avgParticipants._avg.currentParticipants || 0,
      typeCounts,
      popularActivities,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueBreakdown = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Subscription revenue
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        tier: { not: 'FREE' },
        currentPeriodStart: { gte: startDate },
      },
      select: { tier: true },
    });

    const tierPrices: Record<string, number> = {
      BASIC: 9.99,
      PREMIUM: 19.99,
      BUSINESS: 49.99,
    };

    const subscriptionRevenue = subscriptions.reduce(
      (sum, sub) => sum + (tierPrices[sub.tier] || 0),
      0
    );

    // Booking revenue
    const bookingRevenue = await prisma.booking.aggregate({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'COMPLETED',
      },
      _sum: { totalPrice: true },
    });

    // Revenue by day
    const revenueByDay = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, SUM(total_price) as revenue
      FROM "Booking"
      WHERE created_at >= ${startDate} AND payment_status = 'COMPLETED'
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    res.json({
      subscriptionRevenue,
      bookingRevenue: Number(bookingRevenue._sum.totalPrice) || 0,
      totalRevenue: subscriptionRevenue + (Number(bookingRevenue._sum.totalPrice) || 0),
      revenueByDay,
      period,
    });
  } catch (error) {
    next(error);
  }
};
