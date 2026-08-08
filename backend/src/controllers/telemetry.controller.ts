import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TelemetryService } from '../services/telemetry.service';

export class TelemetryController {
  static async getTelemetry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = typeof req.query.period === 'string' ? req.query.period : '1h';
      const data = await TelemetryService.getSystemTelemetry(period);
      res.json({
        success: true,
        telemetry: data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
