import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Validation schema
const componentSchema = z.object({
  category: z.enum(['GPU', 'CPU', 'RAM', 'STORAGE', 'POWER', 'NETWORK', 'MOTHERBOARD', 'COOLING', 'CHASSIS', 'RND', 'ASSEMBLY']),
  name: z.string().min(1),
  spec: z.string().min(1),
  listPrice: z.number().min(0),
  metadata: z.record(z.any()).optional(),
});

// Get all components (public)
router.get('/', async (req, res) => {
  try {
    const components = await prisma.component.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { listPrice: 'asc' },
      ],
    });

    res.json({ components });
  } catch (error) {
    console.error('Get components error:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// Get components by category (public)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const components = await prisma.component.findMany({
      where: {
        category: category.toUpperCase() as any,
        isActive: true,
      },
      orderBy: { listPrice: 'asc' },
    });

    res.json({ components });
  } catch (error) {
    console.error('Get components by category error:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// Create component (admin only)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = componentSchema.parse(req.body);

    const component = await prisma.component.create({
      data,
    });

    res.status(201).json({ component });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create component error:', error);
    res.status(500).json({ error: 'Failed to create component' });
  }
});

// Update component (admin only)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = componentSchema.partial().parse(req.body);

    const component = await prisma.component.update({
      where: { id },
      data,
    });

    res.json({ component });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update component error:', error);
    res.status(500).json({ error: 'Failed to update component' });
  }
});

// Delete component (admin only) - soft delete
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const component = await prisma.component.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Component deleted successfully', component });
  } catch (error) {
    console.error('Delete component error:', error);
    res.status(500).json({ error: 'Failed to delete component' });
  }
});

export default router;
