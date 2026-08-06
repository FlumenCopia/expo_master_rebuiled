import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class MasterItemController {
  static async getAdminMasters(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const masters = await prisma.masterItem.findMany({ orderBy: { createdAt: 'desc' } });
      res.json({ success: true, masters });
    } catch (error) {
      next(error);
    }
  }

  static async createMasterItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, name, code } = req.body;
      const master = await prisma.masterItem.create({
        data: { type, name, code: code || '' },
      });
      res.json({ success: true, message: 'Master item added', master });
    } catch (error) {
      next(error);
    }
  }
}
