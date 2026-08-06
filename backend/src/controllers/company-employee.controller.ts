import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { generateBadgeCode } from '../middleware/security';

export class CompanyEmployeeController {
  static async getAdminEmployees(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employees = await prisma.companyEmployee.findMany({ orderBy: { createdAt: 'desc' } });
      res.json({ success: true, employees });
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
