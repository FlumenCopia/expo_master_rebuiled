import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class FoodItemController {
  static async getAdminFoodItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await prisma.foodItem.findMany({ orderBy: { createdAt: 'desc' } });
      res.json({ success: true, items });
    } catch (error) {
      next(error);
    }
  }

  static async createFoodItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, category, price, description, status } = req.body;
      const item = await prisma.foodItem.create({
        data: {
          name,
          category: category || 'Snacks',
          price: price ? parseFloat(price) : 0,
          description: description || '',
          status: status || 'AVAILABLE',
        },
      });
      res.json({ success: true, message: 'Food item added', item });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFoodItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.foodItem.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Food item deleted' });
    } catch (error) {
      next(error);
    }
  }
}
