import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { ExhibitorRegistrationSchema, ExhibitorUpdateSchema } from '../middleware/security';

export class ExhibitorController {
  // Public Exhibitor Registration
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = ExhibitorRegistrationSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.issues[0]?.message || 'Invalid details' });
        return;
      }

      const data = validation.data;
      const existing = await prisma.exhibitor.findUnique({ where: { email: data.email } });

      if (existing) {
        res.json({ success: true, message: 'Exhibitor already registered!', exhibitor: existing });
        return;
      }

      const exhibitor = await prisma.exhibitor.create({
        data: {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          email: data.email,
          phone: data.phone,
          website: data.website || '',
          productCategory: data.productCategory || '',
          stallSize: data.stallSize || 'Standard',
          notes: data.notes || '',
          status: 'PENDING',
        },
      });

      res.json({ success: true, message: 'Exhibitor booking request submitted!', exhibitor });
    } catch (error) {
      next(error);
    }
  }

  // Admin Exhibitors List
  static async getAdminExhibitors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exhibitors = await prisma.exhibitor.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, exhibitors });
    } catch (error) {
      next(error);
    }
  }

  // Admin Update Exhibitor Status & Stall
  static async updateExhibitorStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validation = ExhibitorUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.issues[0]?.message || 'Invalid payload' });
        return;
      }

      const { status, stallNumber, notes } = validation.data;

      const updated = await prisma.exhibitor.update({
        where: { id },
        data: {
          ...(status && { status: status as any }),
          ...(stallNumber !== undefined && { stallNumber }),
          ...(notes !== undefined && { notes }),
        },
      });

      res.json({ success: true, message: 'Exhibitor status updated', exhibitor: updated });
    } catch (error) {
      next(error);
    }
  }
}
