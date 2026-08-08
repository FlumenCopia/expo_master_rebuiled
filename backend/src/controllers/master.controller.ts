import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class MasterItemController {
  static async getAdminMasters(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const type = (req.query.type as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (type && type !== 'ALL') where.type = type;

      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { type: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [masters, totalCount] = await Promise.all([
        prisma.masterItem.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.masterItem.count({ where }),
      ]);

      res.json({
        success: true,
        masters,
        stats: { total: totalCount },
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

  static async createMasterItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, name, code } = req.body;
      if (!type || !name) {
        res.status(400).json({ error: 'Type and name are required' });
        return;
      }
      const master = await prisma.masterItem.create({
        data: { type, name, code: code || '' },
      });
      res.json({ success: true, message: 'Master item added', master });
    } catch (error) {
      next(error);
    }
  }

  static async updateMasterItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { type, name, code } = req.body;
      const master = await prisma.masterItem.update({
        where: { id },
        data: {
          ...(type && { type }),
          ...(name && { name }),
          ...(code !== undefined && { code }),
        },
      });
      res.json({ success: true, message: 'Master item updated', master });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMasterItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.masterItem.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Master item deleted' });
    } catch (error) {
      next(error);
    }
  }
}
