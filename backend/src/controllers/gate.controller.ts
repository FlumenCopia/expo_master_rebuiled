import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class GateController {
  // Get all Gates
  static async getGates(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const gates = await prisma.gate.findMany({
        orderBy: { code: 'asc' },
      });
      res.json({ success: true, gates });
    } catch (error) {
      next(error);
    }
  }

  // Create new Gate
  static async createGate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, code, hall, status } = req.body;
      if (!name || !code) {
        res.status(400).json({ error: 'Gate Name and Gate Code are required' });
        return;
      }

      const existing = await prisma.gate.findUnique({ where: { code: code.trim().toUpperCase() } });
      if (existing) {
        res.status(400).json({ error: 'Gate Code already exists' });
        return;
      }

      const gate = await prisma.gate.create({
        data: {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          hall: hall || 'Main Hall',
          status: status || 'ACTIVE',
        },
      });

      res.json({ success: true, message: 'Gate created successfully', gate });
    } catch (error) {
      next(error);
    }
  }

  // Update Gate
  static async updateGate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, hall, status } = req.body;

      const gate = await prisma.gate.update({
        where: { id },
        data: {
          ...(name && { name: name.trim() }),
          ...(hall && { hall: hall.trim() }),
          ...(status && { status }),
        },
      });

      res.json({ success: true, message: 'Gate updated successfully', gate });
    } catch (error) {
      next(error);
    }
  }

  // Delete Gate
  static async deleteGate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.gate.delete({ where: { id } });
      res.json({ success: true, message: 'Gate deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
