import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class SettingsController {
  static async getAdminSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await prisma.systemSetting.findMany();
      const settingsMap: Record<string, string> = {};
      settings.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      res.json({ success: true, settings: settingsMap });
    } catch (error) {
      next(error);
    }
  }

  static async updateAdminSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = req.body;
      for (const [key, value] of Object.entries(settings)) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
      res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
      next(error);
    }
  }
}
