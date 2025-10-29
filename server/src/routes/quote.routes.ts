import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { generateQuoteNumber } from '../utils/auth.utils';

const router = Router();

// Validation schemas
const quoteItemSchema = z.object({
  componentId: z.string().optional(),
  category: z.string(),
  name: z.string(),
  spec: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
});

const createQuoteSchema = z.object({
  configuration: z.record(z.any()),
  items: z.array(quoteItemSchema),
  totalPrice: z.number().min(0),
  notes: z.string().optional(),
});

const updateQuoteStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'COMPLETED']),
  adminNotes: z.string().optional(),
});

// Create quote (authenticated users)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const data = createQuoteSchema.parse(req.body);

    const quote = await prisma.quote.create({
      data: {
        quoteNumber: generateQuoteNumber(),
        userId: req.user.userId,
        totalPrice: data.totalPrice,
        configuration: data.configuration,
        notes: data.notes,
        items: {
          create: data.items,
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    res.status(201).json({ quote });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create quote error:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Get all quotes (user sees their own, admin sees all)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { status, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // If not admin, filter by userId
    if (req.user.role !== 'ADMIN') {
      where.userId = req.user.userId;
    }

    // Filter by status if provided
    if (status && typeof status === 'string') {
      where.status = status.toUpperCase();
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          items: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              company: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.quote.count({ where }),
    ]);

    res.json({
      quotes,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get quote by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            component: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && quote.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ quote });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Update quote status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateQuoteStatusSchema.parse(req.body);

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        status: data.status,
        adminNotes: data.adminNotes,
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            company: true,
          },
        },
      },
    });

    res.json({ quote });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update quote status error:', error);
    res.status(500).json({ error: 'Failed to update quote status' });
  }
});

// Delete quote (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.quote.delete({
      where: { id },
    });

    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// Get quote statistics (admin only)
router.get('/stats/summary', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [
      totalQuotes,
      pendingQuotes,
      approvedQuotes,
      rejectedQuotes,
      totalRevenue,
    ] = await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { status: 'PENDING' } }),
      prisma.quote.count({ where: { status: 'APPROVED' } }),
      prisma.quote.count({ where: { status: 'REJECTED' } }),
      prisma.quote.aggregate({
        where: { status: 'APPROVED' },
        _sum: { totalPrice: true },
      }),
    ]);

    res.json({
      totalQuotes,
      pendingQuotes,
      approvedQuotes,
      rejectedQuotes,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    });
  } catch (error) {
    console.error('Get quote stats error:', error);
    res.status(500).json({ error: 'Failed to fetch quote statistics' });
  }
});

export default router;
