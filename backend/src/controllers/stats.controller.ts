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

      // Dynamic Venue Capacity calculation (Read from SystemSetting or scale with total registrations)
      const capacitySetting = await prisma.systemSetting.findUnique({ where: { key: 'MAX_VENUE_CAPACITY' } }).catch(() => null);
      const configuredCapacity = capacitySetting ? parseInt(capacitySetting.value, 10) : 0;
      const venueCapacity = configuredCapacity > 0 
        ? Math.max(configuredCapacity, currentlyInside)
        : Math.max(totalVisitors, 150000);

      const occupancyPercentage = Math.min(100, Math.round((currentlyInside / venueCapacity) * 100));
      const occupancyStatus = occupancyPercentage >= 90 ? 'CRITICAL' : occupancyPercentage >= 75 ? 'WARNING' : 'NORMAL';

      const oneHourAgo = new Date(Date.now() - 3600000);
      const [entriesPastHour, exitsPastHour] = await Promise.all([
        prisma.gateLog.count({ where: { scanType: 'ENTRY', status: 'SUCCESS', scannedAt: { gte: oneHourAgo } } }).catch(() => 0),
        prisma.gateLog.count({ where: { scanType: 'EXIT', status: 'SUCCESS', scannedAt: { gte: oneHourAgo } } }).catch(() => 0),
      ]);

      res.json({
        success: true,
        stats: {
          currentExhibitors: totalExhibitors,
          currentEventRegistrations: totalVisitors,
          totalRegistrationCount: totalVisitors,
          totalVisitorsCount: totalGateLogs,
          currentEventVisitors: currentlyInside,
          currentlyInside,
          venueCapacity,
          occupancyPercentage,
          occupancyStatus,
          entriesPastHour,
          exitsPastHour,
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

