import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class EventController {
  static async getAdminEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await prisma.event.findMany({ orderBy: { createdAt: 'desc' } });
      res.json({ success: true, events });
    } catch (error) {
      next(error);
    }
  }

  static async createEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, venue, description, status } = req.body;
      const event = await prisma.event.create({
        data: { title, venue: venue || '', description: description || '', status: status || 'ACTIVE' },
      });
      res.json({ success: true, message: 'Event created', event });
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
