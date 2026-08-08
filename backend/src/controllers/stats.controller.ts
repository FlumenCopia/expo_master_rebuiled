import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export class StatsController {
  static async getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalVisitors,
        checkedInCount,
        onBreakCount,
        checkedOutCount,
        totalExhibitors,
        companyEmployeesCount,
        gateInUsed,
        gateInTotal,
        gateOutUsed,
        gateOutTotal,
        totalGateLogs,
        recentVisitors,
      ] = await Promise.all([
        prisma.visitor.count().catch(() => 0),
        prisma.visitor.count({ where: { status: 'CHECKED_IN' } }).catch(() => 0),
        prisma.visitor.count({ where: { status: 'ON_BREAK' as any } }).catch(() => 0),
        prisma.visitor.count({ where: { status: 'CHECKED_OUT' as any } }).catch(() => 0),
        prisma.exhibitor.count().catch(() => 0),
        prisma.companyEmployee.count().catch(() => 0),
        prisma.gatePass.count({ where: { type: 'GATE_IN', status: 'USED' } }).catch(() => 0),
        prisma.gatePass.count({ where: { type: 'GATE_IN' } }).catch(() => 0),
        prisma.gatePass.count({ where: { type: 'GATE_OUT', status: 'USED' } }).catch(() => 0),
        prisma.gatePass.count({ where: { type: 'GATE_OUT' } }).catch(() => 0),
        prisma.gateLog.count().catch(() => 0),
        prisma.visitor.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }).catch(() => []),
      ]);

      // "Currently Inside" = CHECKED_IN
      const currentlyInside = checkedInCount;

      res.json({
        success: true,
        stats: {
          currentExhibitors: totalExhibitors,
          currentEventRegistrations: totalVisitors,
          totalRegistrationCount: totalVisitors,
          totalVisitorsCount: totalGateLogs,
          currentEventVisitors: currentlyInside,
          currentExhibitorEmployees: companyEmployeesCount,
          checkedInCount,
          onBreakCount,
          checkedOutCount,
          gateInPasses: {
            used: gateInUsed,
            unused: Math.max(0, gateInTotal - gateInUsed),
            total: gateInTotal,
            usedPercentage: gateInTotal > 0 ? Math.round((gateInUsed / gateInTotal) * 100) : 0,
          },
          gateOutPasses: {
            used: gateOutUsed,
            unused: Math.max(0, gateOutTotal - gateOutUsed),
            total: gateOutTotal,
            usedPercentage: gateOutTotal > 0 ? Math.round((gateOutUsed / gateOutTotal) * 100) : 0,
          },
          recentVisitors,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

