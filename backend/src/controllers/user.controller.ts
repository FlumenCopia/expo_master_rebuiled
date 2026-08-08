import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

export class UserController {
  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const role = (req.query.role as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (role && role !== 'ALL') {
        where.role = role;
      }

      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [users, totalCount, superAdminsCount, eventManagersCount, gateOfficersCount] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
        prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
        prisma.user.count({ where: { role: 'EVENT_MANAGER' } }),
        prisma.user.count({ where: { role: 'GATE_OFFICER' } }),
      ]);

      res.json({
        success: true,
        users,
        stats: {
          total: totalCount,
          superAdmins: superAdminsCount,
          eventManagers: eventManagersCount,
          gateOfficers: gateOfficersCount,
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

  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
      }

      const cleanEmail = String(email).toLowerCase().trim();
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        res.status(400).json({ error: 'A user with this email already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userRole = ['SUPER_ADMIN', 'EVENT_MANAGER', 'GATE_OFFICER'].includes(role)
        ? role
        : 'GATE_OFFICER';

      const user = await prisma.user.create({
        data: {
          name,
          email: cleanEmail,
          password: hashedPassword,
          role: userRole as any,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      res.json({ success: true, message: 'User created successfully', user });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, role, password } = req.body;

      const existing = await prisma.user.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const validRoles = ['SUPER_ADMIN', 'EVENT_MANAGER', 'GATE_OFFICER'];
      const updateData: any = {};

      if (name) updateData.name = name;
      if (role && validRoles.includes(role)) updateData.role = role;
      if (password) updateData.password = await bcrypt.hash(password, 12);

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true, updatedAt: true },
      });

      res.json({ success: true, message: 'User updated successfully', user });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      await prisma.user.delete({ where: { id } });
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
