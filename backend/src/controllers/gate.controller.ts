import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export class GateController {
  static async getGates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let gates = await prisma.masterItem.findMany({
        where: { type: 'GATE' },
        orderBy: { name: 'asc' },
      });

      // Default Seeder if no gates exist yet
      if (gates.length === 0) {
        const defaultGateNames = [
          'Main Entrance Gate 1',
          'South Exit Gate 2',
          'VIP Entrance Gate 3',
          'Exhibitor Hall Gate 4',
        ];
        for (const name of defaultGateNames) {
          await prisma.masterItem.create({
            data: { type: 'GATE', name, status: 'ACTIVE' },
          });
        }
        gates = await prisma.masterItem.findMany({
          where: { type: 'GATE' },
          orderBy: { name: 'asc' },
        });
      }

      res.json({ success: true, gates });
    } catch (error) {
      next(error);
    }
  }

  static async createGate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({ error: 'Gate name must be at least 2 characters' });
        return;
      }

      const gate = await prisma.masterItem.create({
        data: {
          type: 'GATE',
          name: name.trim(),
          status: 'ACTIVE',
        },
      });

      res.json({ success: true, message: 'Gate added successfully', gate });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.masterItem.delete({ where: { id } });
      res.json({ success: true, message: 'Gate deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
