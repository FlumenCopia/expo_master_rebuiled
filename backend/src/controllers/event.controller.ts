import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class EventController {
  static async getAdminEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status && status !== 'ALL') where.status = status;

      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { venue: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [events, totalCount, activeCount, inactiveCount] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.event.count({ where }),
        prisma.event.count({ where: { status: 'ACTIVE' } }),
        prisma.event.count({ where: { status: 'INACTIVE' } }),
      ]);

      res.json({
        success: true,
        events,
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

  static async createEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, venue, description, status } = req.body;
      if (!title) {
        res.status(400).json({ error: 'Event title is required' });
        return;
      }
      const event = await prisma.event.create({
        data: { title, venue: venue || '', description: description || '', status: status || 'ACTIVE' },
      });
      res.json({ success: true, message: 'Event created', event });
    } catch (error) {
      next(error);
    }
  }

  static async updateEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, venue, description, status } = req.body;

      const event = await prisma.event.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(venue !== undefined && { venue }),
          ...(description !== undefined && { description }),
          ...(status && { status }),
        },
      });
      res.json({ success: true, message: 'Event updated', event });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.event.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
      next(error);
    }
  }
}
