import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/email.service';

export class ReminderController {
  /**
   * Batch trigger reminder emails to registered Visitors
   */
  static async triggerVisitorReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(500, Math.max(1, parseInt((req.query.limit as string) || '50', 10)));
      
      const visitors = await prisma.visitor.findMany({
        where: {
          status: 'REGISTERED',
          email: { not: { endsWith: '@expokerala.local' } },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      let sentCount = 0;
      for (const visitor of visitors) {
        if (visitor.email) {
          const success = await EmailService.sendVisitorReminderEmail({
            fullName: visitor.fullName,
            email: visitor.email,
            badgeCode: visitor.badgeCode,
          });
          if (success) sentCount++;
        }
      }

      res.json({
        success: true,
        message: `Dispatched ${sentCount} visitor reminder emails out of ${visitors.length} candidates.`,
        sentCount,
        totalCandidates: visitors.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch trigger reminder emails to registered Exhibitors
   */
  static async triggerExhibitorReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Math.min(500, Math.max(1, parseInt((req.query.limit as string) || '50', 10)));

      const exhibitors = await prisma.exhibitor.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      let sentCount = 0;
      for (const exhibitor of exhibitors) {
        if (exhibitor.email) {
          const success = await EmailService.sendExhibitorReminderEmail({
            companyName: exhibitor.companyName,
            contactPerson: exhibitor.contactPerson,
            email: exhibitor.email,
            stallNumber: exhibitor.stallNumber || undefined,
          });
          if (success) sentCount++;
        }
      }

      res.json({
        success: true,
        message: `Dispatched ${sentCount} exhibitor reminder emails out of ${exhibitors.length} candidates.`,
        sentCount,
        totalCandidates: exhibitors.length,
      });
    } catch (error) {
      next(error);
    }
  }
}
