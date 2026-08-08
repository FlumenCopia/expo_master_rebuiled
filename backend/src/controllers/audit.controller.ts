import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class AuditController {
  // Record security audit log entry
  static async logEvent(userId: string | undefined, userEmail: string | undefined, action: string, details?: string, ipAddress?: string) {
    try {
      await (prisma as any).auditLog.create({
        data: {
          userId,
          userEmail,
          action,
          details: details ? String(details) : null,
          ipAddress,
        },
      });
    } catch (err) {
      console.error('AuditLog Error:', err);
    }
  }

  // Get audit logs for admin review
  static async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '30', 10)));
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        (prisma as any).auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        (prisma as any).auditLog.count(),
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
