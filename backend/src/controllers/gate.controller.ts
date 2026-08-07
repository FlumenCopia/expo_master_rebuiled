import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class GateController {
  // Get Gates with search, status filters, pagination, and stats
  static async getGates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status && status !== 'ALL') {
        where.status = status;
      }

      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { hall: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [gates, totalCount, activeCount, inactiveCount] = await Promise.all([
        prisma.gate.findMany({
          where,
          orderBy: { code: 'asc' },
          skip,
          take: limit,
        }),
        prisma.gate.count({ where }),
        prisma.gate.count({ where: { status: 'ACTIVE' } }),
        prisma.gate.count({ where: { status: 'INACTIVE' } }),
      ]);

      res.json({
        success: true,
        gates,
        stats: {
          total: totalCount,
          active: activeCount,
          inactive: inactiveCount,
        },
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(totalCount / limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new Gate
  static async createGate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, hall, status } = req.body;
      if (!name) {
        res.status(400).json({ error: 'Gate Name is required' });
        return;
      }

      const count = await prisma.gate.count();
      const code = `G${String(count + 1).padStart(3, '0')}`;

      const gate = await prisma.gate.create({
        data: {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          hall: hall || 'Main Hall',
          status: status || 'ACTIVE',
        },
      });

      res.json({ success: true, message: 'Gate created successfully', gate });
    } catch (error) {
      next(error);
    }
  }

  // Update Gate
  static async updateGate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, hall, status } = req.body;

      const gate = await prisma.gate.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(hall && { hall: hall.trim() }),
          ...(status && { status }),
        },
      });

      res.json({ success: true, message: 'Gate updated successfully', gate });
    } catch (error) {
      next(error);
    }
  }

  // Delete Gate
  static async deleteGate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.gate.delete({ where: { id } });
      res.json({ success: true, message: 'Gate deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
