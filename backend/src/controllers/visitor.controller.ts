import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import {
  VisitorRegistrationSchema,
  generateBadgeCode,
  sanitizeCsvCell,
} from '../middleware/security';

export class VisitorController {
  // Public Phone Autofill Lookup
  static async lookupByPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawPhone = String(req.query.phone || '').trim();
      if (!rawPhone || rawPhone.length < 7) {
        res.status(400).json({ status: false, message: 'Invalid phone number' });
        return;
      }

      const cleanDigits = rawPhone.replace(/\D/g, '');
      const lastDigits = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

      const visitor = await prisma.visitor.findFirst({
        where: {
          OR: [
            { phone: { contains: lastDigits } },
            { phone: { contains: rawPhone } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!visitor) {
        res.json({ status: false, message: 'Visitor not found' });
        return;
      }

      const v = visitor as any;
      res.json({
        status: true,
        data: {
          name: v.fullName,
          email: v.email,
          firm_name: v.company || '',
          designation: v.designation || '',
          location: v.address || '',
          post: v.post || '',
          city: v.city || '',
          district: v.district || '',
          state: v.state || '',
          pincode: v.pincode || '',
          landmark: v.landmark || '',
          profile: v.subEvents?.[1] || v.category || '',
          mobile_code: v.countryCode || '91',
          country: v.country || 'India',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Public Visitor Registration
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body;

      if (body.honeypot && body.honeypot.trim() !== '') {
        res.json({ success: true, message: 'Registration received' });
        return;
      }

      const validation = VisitorRegistrationSchema.safeParse(body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.issues[0]?.message || 'Invalid input details' });
        return;
      }

      const data = validation.data;
      const cleanEmail = (data.email || '').trim().toLowerCase();

      let existing = null;
      if (cleanEmail) {
        existing = await prisma.visitor.findFirst({
          where: {
            OR: [{ email: cleanEmail }, { phone: data.phone }],
          },
        });
      } else {
        existing = await prisma.visitor.findFirst({
          where: { phone: data.phone },
        });
      }

      if (existing) {
        res.json({
          success: true,
          alreadyRegistered: true,
          message: 'You are already registered for EXPO26!',
          badgeCode: existing.badgeCode,
          visitor: existing,
        });
        return;
      }

      let badgeCode = generateBadgeCode();
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 5) {
        const checkCode = await prisma.visitor.findUnique({ where: { badgeCode } });
        if (!checkCode) isUnique = true;
        else {
          badgeCode = generateBadgeCode();
          attempts++;
        }
      }

      const visitor = await prisma.visitor.create({
        data: {
          badgeCode,
          fullName: data.fullName,
          email: cleanEmail || `${data.phone}@expokerala.local`,
          phone: data.phone,
          company: data.company || '',
          designation: data.designation || '',
          city: data.city || '',
          district: data.district || '',
          state: data.state || 'Kerala',
          pincode: data.pincode || '',
          address: data.address || '',
          post: data.post || '',
          landmark: data.landmark || '',
          country: data.country || 'India',
          countryCode: data.countryCode || '91',
          category: (data.category as any) || 'VISITOR',
          subEvents: data.subEvents || [],
          status: 'REGISTERED',
        },
      });

      res.json({
        success: true,
        message: 'Registration successful!',
        badgeCode: visitor.badgeCode,
        visitor,
      });
    } catch (error) {
      next(error);
    }
  }

  // Public Badge Pass Lookup by Code
  static async getBadgeByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.params.code.toUpperCase();
      const visitor = await prisma.visitor.findUnique({ where: { badgeCode: code } });

      if (!visitor) {
        res.status(404).json({ error: 'Badge pass not found' });
        return;
      }

      res.json({ success: true, visitor });
    } catch (error) {
      next(error);
    }
  }

  // Admin Visitor Directory & CSV Export
  static async getAdminVisitors(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || '';
      const category = (req.query.category as string) || '';
      const exportFormat = req.query.export as string;
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (status && status !== 'ALL') where.status = status;
      if (category && category !== 'ALL') where.category = category;

      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { badgeCode: { contains: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (exportFormat === 'csv') {
        const allVisitors = await prisma.visitor.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 75000,
        });

        let csv = 'Badge Code,Full Name,Email,Phone,Company,Designation,Address,Post,City,District,State,Pincode,Landmark,Country,Category,Status,Registered At\n';
        allVisitors.forEach((v: any) => {
          const row = [
            sanitizeCsvCell(v.badgeCode),
            sanitizeCsvCell(v.fullName),
            sanitizeCsvCell(v.email),
            sanitizeCsvCell(v.phone),
            sanitizeCsvCell(v.company),
            sanitizeCsvCell(v.designation),
            sanitizeCsvCell(v.address),
            sanitizeCsvCell(v.post),
            sanitizeCsvCell(v.city),
            sanitizeCsvCell(v.district),
            sanitizeCsvCell(v.state),
            sanitizeCsvCell(v.pincode),
            sanitizeCsvCell(v.landmark),
            sanitizeCsvCell(v.country),
            sanitizeCsvCell(v.category),
            sanitizeCsvCell(v.status),
            sanitizeCsvCell(new Date(v.createdAt).toISOString()),
          ].join(',');
          csv += row + '\n';
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="EXPO26_Visitors_Export_${Date.now()}.csv"`);
        res.status(200).send(csv);
        return;
      }

      const [visitors, totalCount] = await Promise.all([
        prisma.visitor.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.visitor.count({ where }),
      ]);

      res.json({
        success: true,
        visitors,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin Visitor Delete
  static async deleteVisitor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.visitor.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Visitor record deleted' });
    } catch (error) {
      next(error);
    }
  }
}
