import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { sanitizeCsvCell } from '../middleware/security';
import { AuditController } from './audit.controller';

export class ExhibitorLeadController {
  // Stall Lead Scan: Record visitor badge scan at exhibitor booth
  static async scanVisitorLead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { badgeCode, exhibitorId, rating = 'WARM', notes } = req.body;

      if (!badgeCode || typeof badgeCode !== 'string') {
        res.status(400).json({ success: false, message: 'Badge code is required' });
        return;
      }

      const cleanCode = badgeCode.trim().toUpperCase();

      // Resolve Visitor by badge code
      const visitor = await prisma.visitor.findUnique({
        where: { badgeCode: cleanCode },
      });

      if (!visitor) {
        res.status(404).json({
          success: false,
          code: 'VISITOR_NOT_FOUND',
          message: `❌ Invalid Badge Code: ${cleanCode}`,
        });
        return;
      }

      // Determine target Exhibitor ID (from body or first active exhibitor)
      let targetExhibitorId = exhibitorId;
      if (!targetExhibitorId) {
        const defaultExhibitor = await prisma.exhibitor.findFirst({
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' },
        });
        if (defaultExhibitor) {
          targetExhibitorId = defaultExhibitor.id;
        }
      }

      if (!targetExhibitorId) {
        res.status(400).json({ success: false, message: 'No valid exhibitor company found' });
        return;
      }

      // Upsert Exhibitor Lead (create or update notes/rating)
      const lead = await (prisma as any).exhibitorLead.upsert({
        where: {
          exhibitorId_visitorId: {
            exhibitorId: targetExhibitorId,
            visitorId: visitor.id,
          },
        },
        update: {
          rating,
          notes: notes ? String(notes) : undefined,
          scannedBy: req.user?.name || req.user?.email || 'Exhibitor Staff',
          scannedAt: new Date(),
        },
        create: {
          exhibitorId: targetExhibitorId,
          visitorId: visitor.id,
          rating,
          notes: notes ? String(notes) : null,
          scannedBy: req.user?.name || req.user?.email || 'Exhibitor Staff',
        },
        include: {
          visitor: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              company: true,
              designation: true,
              badgeCode: true,
              category: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: `🌟 Lead Captured! ${visitor.fullName} (${visitor.company || 'Attendee'}) recorded.`,
        lead,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get list of leads for an exhibitor with filtering, search & pagination
  static async getExhibitorLeads(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exhibitorId = req.query.exhibitorId as string;
      const search = (req.query.search as string || '').trim();
      const rating = (req.query.rating as string || '').trim();
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (exhibitorId) {
        where.exhibitorId = exhibitorId;
      }

      if (rating && rating !== 'ALL') {
        where.rating = rating;
      }

      if (search !== '') {
        where.OR = [
          { visitor: { fullName: { contains: search, mode: 'insensitive' } } },
          { visitor: { company: { contains: search, mode: 'insensitive' } } },
          { visitor: { email: { contains: search, mode: 'insensitive' } } },
          { visitor: { phone: { contains: search, mode: 'insensitive' } } },
          { visitor: { badgeCode: { contains: search, mode: 'insensitive' } } },
          { notes: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [leads, total, ratingStats] = await Promise.all([
        (prisma as any).exhibitorLead.findMany({
          where,
          orderBy: { scannedAt: 'desc' },
          skip,
          take: limit,
          include: {
            visitor: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                company: true,
                designation: true,
                badgeCode: true,
                category: true,
                city: true,
              },
            },
            exhibitor: {
              select: {
                companyName: true,
                stallNumber: true,
              },
            },
          },
        }),
        (prisma as any).exhibitorLead.count({ where }),
        (prisma as any).exhibitorLead.groupBy({
          by: ['rating'],
          where: exhibitorId ? { exhibitorId } : {},
          _count: { rating: true },
        }),
      ]);

      const ratingsCount = {
        HOT: ratingStats.find((r: any) => r.rating === 'HOT')?._count.rating || 0,
        WARM: ratingStats.find((r: any) => r.rating === 'WARM')?._count.rating || 0,
        COLD: ratingStats.find((r: any) => r.rating === 'COLD')?._count.rating || 0,
      };

      res.json({
        success: true,
        data: leads,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          ratingsCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update lead rating or notes
  static async updateLead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { rating, notes } = req.body;

      const updatedLead = await (prisma as any).exhibitorLead.update({
        where: { id },
        data: {
          ...(rating && { rating }),
          ...(notes !== undefined && { notes: String(notes) }),
        },
        include: {
          visitor: { select: { fullName: true, company: true } },
        },
      });

      res.json({
        success: true,
        message: 'Lead details updated successfully',
        lead: updatedLead,
      });
    } catch (error) {
      next(error);
    }
  }

  // Export leads to CSV format for Exhibitors
  static async exportExhibitorLeadsCsv(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const exhibitorId = req.query.exhibitorId as string;
      const where: any = {};
      if (exhibitorId) where.exhibitorId = exhibitorId;

      const leads = await (prisma as any).exhibitorLead.findMany({
        where,
        orderBy: { scannedAt: 'desc' },
        include: {
          visitor: true,
          exhibitor: { select: { companyName: true, stallNumber: true } },
        },
      });

      let csv = 'Scanned At,Badge Code,Full Name,Company,Designation,Email,Phone,City,Lead Rating,Stall Notes,Scanned By,Exhibitor Company\n';

      leads.forEach((l: any) => {
        const row = [
          sanitizeCsvCell(new Date(l.scannedAt).toISOString()),
          sanitizeCsvCell(l.visitor?.badgeCode || ''),
          sanitizeCsvCell(l.visitor?.fullName || ''),
          sanitizeCsvCell(l.visitor?.company || ''),
          sanitizeCsvCell(l.visitor?.designation || ''),
          sanitizeCsvCell(l.visitor?.email || ''),
          sanitizeCsvCell(l.visitor?.phone || ''),
          sanitizeCsvCell(l.visitor?.city || ''),
          sanitizeCsvCell(l.rating),
          sanitizeCsvCell(l.notes || ''),
          sanitizeCsvCell(l.scannedBy || ''),
          sanitizeCsvCell(l.exhibitor?.companyName || ''),
        ];
        csv += row.join(',') + '\n';
      });

      const filename = `exhibitor_leads_${Date.now()}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Log security audit trail
      AuditController.logEvent(
        req.user?.id,
        req.user?.email,
        'EXPORT_EXHIBITOR_LEADS_CSV',
        `Exported ${leads.length} stall lead records`,
        req.ip
      );

      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}
