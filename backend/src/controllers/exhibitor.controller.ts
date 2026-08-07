import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { ExhibitorRegistrationSchema, ExhibitorUpdateSchema, generateBadgeCode } from '../middleware/security';
import { EmailService } from '../services/email.service';

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

      let badgeCode = '';
      const existingVisitor = await prisma.visitor.findFirst({
        where: { OR: [{ email: data.email }, { phone: data.phone }] },
      });

      if (existingVisitor) {
        badgeCode = existingVisitor.badgeCode;
      } else {
        badgeCode = generateBadgeCode();
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
          const check = await prisma.visitor.findUnique({ where: { badgeCode } });
          if (!check) isUnique = true;
          else {
            badgeCode = generateBadgeCode();
            attempts++;
          }
        }

        await prisma.visitor.create({
          data: {
            badgeCode,
            fullName: data.contactPerson,
            email: data.email,
            phone: data.phone,
            company: data.companyName,
            designation: 'Exhibitor Representative',
            category: 'EXHIBITOR',
            status: 'REGISTERED',
          },
        });
      }

      if (existing) {
        res.json({
          success: true,
          message: 'Exhibitor already registered!',
          badgeCode,
          exhibitor: existing,
        });
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

      // Dispatch Welcome Email asynchronously with badge details
      if (exhibitor.email) {
        EmailService.sendExhibitorWelcomeEmail({
          companyName: exhibitor.companyName,
          contactPerson: exhibitor.contactPerson,
          email: exhibitor.email,
          stallNumber: exhibitor.stallNumber || undefined,
        }).catch((err) => console.error('Exhibitor welcome email background error:', err));
      }

      res.json({
        success: true,
        message: 'Exhibitor booking request submitted!',
        badgeCode,
        exhibitor,
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin Exhibitors List with search, status filters, pagination, and stats
  static async getAdminExhibitors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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
          { companyName: { contains: q, mode: 'insensitive' } },
          { contactPerson: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { stallNumber: { contains: q, mode: 'insensitive' } },
          { productCategory: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [exhibitors, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
        prisma.exhibitor.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.exhibitor.count({ where }),
        prisma.exhibitor.count({ where: { status: 'PENDING' } }),
        prisma.exhibitor.count({ where: { status: 'APPROVED' } }),
        prisma.exhibitor.count({ where: { status: 'REJECTED' } }),
      ]);

      res.json({
        success: true,
        exhibitors,
        stats: {
          total: totalCount,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
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
