import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { generateBadgeCode } from '../middleware/security';

export class CompanyEmployeeController {
  static async getAdminEmployees(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

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
      const { fullName, companyName, email, phone, designation } = req.body;
      const employee = await prisma.companyEmployee.create({
        data: {
          fullName,
          companyName,
          email,
          phone,
          designation: designation || '',
          badgeCode: generateBadgeCode(),
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
