import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { ExhibitorRegistrationSchema, ExhibitorUpdateSchema, generateBadgeCode, sanitizeCsvCell } from '../middleware/security';
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
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanPhoneDigits = data.phone.replace(/\D/g, '');
      const last10Digits = cleanPhoneDigits.length >= 10 ? cleanPhoneDigits.slice(-10) : cleanPhoneDigits;

      const existing = await prisma.exhibitor.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            { phone: { contains: last10Digits } },
          ],
        },
      });

      let badgeCode = '';
      const existingVisitor = await prisma.visitor.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            { phone: { contains: last10Digits } },
          ],
        },
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
            email: cleanEmail,
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
          alreadyRegistered: true,
          message: 'Exhibitor registration already exists for this email or phone number!',
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
      const exportFormat = req.query.export as string;
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

      if (exportFormat === 'csv') {
        const allExhibitors = await prisma.exhibitor.findMany({
          where,
          include: {
            _count: {
              select: { employees: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10000,
        });

        let csv = 'Company Name,Contact Person,Email,Phone,Website,Product Category,Stall Number,Stall Size,Status,Staff Passes Count,Registered At\n';
        allExhibitors.forEach((ex: any) => {
          const row = [
            sanitizeCsvCell(ex.companyName),
            sanitizeCsvCell(ex.contactPerson),
            sanitizeCsvCell(ex.email),
            sanitizeCsvCell(ex.phone),
            sanitizeCsvCell(ex.website),
            sanitizeCsvCell(ex.productCategory),
            sanitizeCsvCell(ex.stallNumber),
            sanitizeCsvCell(ex.stallSize),
            sanitizeCsvCell(ex.status),
            sanitizeCsvCell(String(ex._count?.employees || 0)),
            sanitizeCsvCell(new Date(ex.createdAt).toISOString()),
          ].join(',');
          csv += row + '\n';
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="EXPO26_Exhibitors_Export_${Date.now()}.csv"`);
        res.status(200).send(csv);
        return;
      }

      const [exhibitors, totalCount, pendingCount, approvedCount, rejectedCount] = await Promise.all([
        prisma.exhibitor.findMany({
          where,
          include: {
            _count: {
              select: { employees: true },
            },
          },
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

  // Admin Delete Exhibitor
  static async deleteExhibitor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.exhibitor.delete({ where: { id } });
      res.json({ success: true, message: 'Exhibitor deleted' });
    } catch (error) {
      next(error);
    }
  }
}
