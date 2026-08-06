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

  // Admin Sub-Events List
  static async getAdminSubEvents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const subEvents = await prisma.subEvent.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, subEvents });
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
