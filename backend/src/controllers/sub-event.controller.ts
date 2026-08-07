import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class SubEventController {
  // Public Sub-Event Lookup by Slug or Title
  static async getPublicBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug;
      const subEvents = await prisma.subEvent.findMany();

      const found = subEvents.find(
        (s) =>
          s.id === slug ||
          s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug.toLowerCase() ||
          s.title.toLowerCase().includes(slug.toLowerCase().replace(/-/g, ' '))
      );

      if (!found) {
        const formattedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        res.json({
          success: true,
          subEvent: {
            id: 'custom-' + slug,
            title: formattedTitle,
            description: `Registration for ${formattedTitle}`,
            speaker: 'Masters RE Expo Speaker Panel',
            location: 'Main Exhibition Hall',
            date: 'Sep 25 - 27, 2026',
            timeSlot: '10:00 AM - 05:00 PM',
            capacity: 500,
          },
        });
        return;
      }

      res.json({ success: true, subEvent: found });
    } catch (error) {
      next(error);
    }
  }

  // Admin Sub-Events List with search, pagination, and stats
  static async getAdminSubEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { speaker: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [subEvents, totalCount] = await Promise.all([
        prisma.subEvent.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.subEvent.count({ where }),
      ]);

      res.json({
        success: true,
        subEvents,
        stats: {
          total: totalCount,
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

  // Admin Create Sub-Event
  static async createSubEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, speaker, location, date, timeSlot, capacity } = req.body;
      const subEvent = await prisma.subEvent.create({
        data: {
          title,
          description: description || '',
          speaker: speaker || '',
          location: location || '',
          date: date || '',
          timeSlot: timeSlot || '',
          capacity: capacity ? parseInt(capacity, 10) : 200,
        },
      });
      res.json({ success: true, message: 'Sub-event created', subEvent });
    } catch (error) {
      next(error);
    }
  }

  // Admin Delete Sub-Event
  static async deleteSubEvent(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.subEvent.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Sub-event deleted' });
    } catch (error) {
      next(error);
    }
  }
}
