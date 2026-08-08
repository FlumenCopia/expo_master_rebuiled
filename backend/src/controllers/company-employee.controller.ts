import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { generateBadgeCode } from '../middleware/security';

export class CompanyEmployeeController {
  static async getAdminEmployees(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const exhibitorId = (req.query.exhibitorId as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (exhibitorId.trim() !== '') {
        where.exhibitorId = exhibitorId.trim();
      }

      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { fullName: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { badgeCode: { contains: q, mode: 'insensitive' } },
          { designation: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [employees, totalCount] = await Promise.all([
        prisma.companyEmployee.findMany({
          where,
          include: {
            exhibitor: {
              select: {
                id: true,
                companyName: true,
                stallNumber: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.companyEmployee.count({ where }),
      ]);

      res.json({
        success: true,
        employees,
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

  static async createEmployee(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, companyName, email, phone, designation, exhibitorId } = req.body;

      if (!fullName || !phone) {
        res.status(400).json({ error: 'Full Name and Phone Number are required' });
        return;
      }

      const cleanPhoneDigits = String(phone).replace(/\D/g, '');
      const last10Digits = cleanPhoneDigits.length >= 10 ? cleanPhoneDigits.slice(-10) : cleanPhoneDigits;
      const cleanEmail = email ? String(email).trim().toLowerCase() : null;

      // Check if employee with same email or phone already exists
      const existing = await prisma.companyEmployee.findFirst({
        where: {
          OR: [
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
            { phone: { contains: last10Digits } },
          ],
        },
      });

      if (existing) {
        res.status(400).json({ error: `Staff member already registered under ${existing.companyName}` });
        return;
      }

      let finalCompanyName = companyName || '';
      let linkedExhibitorId = exhibitorId || null;

      if (linkedExhibitorId) {
        const exhibitor = await prisma.exhibitor.findUnique({ where: { id: linkedExhibitorId } });
        if (exhibitor) {
          finalCompanyName = exhibitor.companyName;
        }
      } else if (finalCompanyName) {
        // Try matching existing exhibitor by name
        const match = await prisma.exhibitor.findFirst({
          where: { companyName: { equals: finalCompanyName, mode: 'insensitive' } },
        });
        if (match) {
          linkedExhibitorId = match.id;
        }
      }

      const employee = await prisma.companyEmployee.create({
        data: {
          fullName,
          companyName: finalCompanyName,
          email,
          phone,
          designation: designation || '',
          badgeCode: generateBadgeCode(),
          exhibitorId: linkedExhibitorId,
        },
        include: {
          exhibitor: {
            select: {
              id: true,
              companyName: true,
              stallNumber: true,
            },
          },
        },
      });
      res.json({ success: true, message: 'Company employee added', employee });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEmployee(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.companyEmployee.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Employee deleted' });
    } catch (error) {
      next(error);
    }
  }
}
