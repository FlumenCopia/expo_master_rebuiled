import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { CheckInVerificationSchema } from '../middleware/security';

export class CheckInController {
  static async verifyCheckIn(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = CheckInVerificationSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.issues[0]?.message || 'Invalid QR input' });
        return;
      }

      const { badgeCode, gateName, mode } = validation.data;
      const cleanCode = badgeCode.trim().toUpperCase();
      let visitor = await prisma.visitor.findUnique({ where: { badgeCode: cleanCode } });

      if (!visitor) {
        const emp = await prisma.companyEmployee.findFirst({ where: { badgeCode: cleanCode } });
        if (emp) {
          visitor = await prisma.visitor.create({
            data: {
              badgeCode: emp.badgeCode || cleanCode,
              fullName: emp.fullName,
              email: String(emp.email || 'staff@expokerala.com'),
              phone: String(emp.phone || '0000000000'),
              company: emp.companyName,
              designation: emp.designation || 'Exhibitor Staff',
              category: 'EXHIBITOR',
              status: 'REGISTERED',
            },
          });
        }
      }

      if (!visitor) {
        res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          message: '❌ Invalid Badge! Attendee or Staff record not found.',
        });
        return;
      }

      // --- BREAK / PASS-OUT MODE ---
      if (mode === 'BREAK' || mode === 'OUT' || mode === 'EXIT') {
        if (visitor.status !== 'CHECKED_IN') {
          // Log denied exit attempt
          await prisma.gateLog.create({
            data: {
              visitorId: visitor.id,
              scannedById: req.user?.id,
              gateName: gateName || 'Main Entrance',
              scanType: 'EXIT',
              status: 'DENIED',
              notes: 'Visitor was not currently checked in',
            },
          });

          res.json({
            success: false,
            code: 'NOT_INSIDE',
            message: `⚠️ CANNOT EXIT! ${visitor.fullName} is not currently checked inside the venue.`,
            visitor,
          });
          return;
        }

        const updatedVisitor = await prisma.visitor.update({
          where: { id: visitor.id },
          data: {
            status: 'CHECKED_OUT' as any,
            GateLogs: {
              create: {
                gateName: `${gateName || 'Main Entrance'} (EXIT)`,
                scannedById: req.user?.id,
                scanType: 'EXIT',
                status: 'SUCCESS',
              },
            },
          },
        });

        res.json({
          success: true,
          code: 'CHECKED_OUT',
          message: `👋 EXIT APPROVED! ${updatedVisitor.fullName} marked as checked out.`,
          visitor: updatedVisitor,
        });
        return;
      }

      // --- RE-ENTRY MODE ---
      if (mode === 'RE_ENTRY') {
        if (visitor.status === 'CHECKED_IN') {
          await prisma.gateLog.create({
            data: {
              visitorId: visitor.id,
              scannedById: req.user?.id,
              gateName: gateName || 'Main Entrance',
              scanType: 'ENTRY',
              status: 'DUPLICATE_ENTRY',
              notes: 'Visitor is already inside',
            },
          });

          res.json({
            success: false,
            code: 'ALREADY_CHECKED_IN',
            message: `⚠️ ALREADY INSIDE! ${visitor.fullName} is already inside the venue.`,
            visitor,
          });
          return;
        }

        const updatedVisitor = await prisma.visitor.update({
          where: { id: visitor.id },
          data: {
            status: 'CHECKED_IN',
            GateLogs: {
              create: {
                gateName: `${gateName || 'Main Entrance'} (RE-ENTRY)`,
                scannedById: req.user?.id,
                scanType: 'ENTRY',
                status: 'SUCCESS',
              },
            },
          },
        });

        res.json({
          success: true,
          code: 'VERIFIED',
          message: `👋 WELCOME BACK! ${updatedVisitor.fullName} (${updatedVisitor.category}) - Re-entry Approved!`,
          visitor: updatedVisitor,
        });
        return;
      }

      // --- ENTRY / CHECK-IN MODE (Default) ---
      if (visitor.status === 'CHECKED_IN') {
        await prisma.gateLog.create({
          data: {
            visitorId: visitor.id,
            scannedById: req.user?.id,
            gateName: gateName || 'Main Entrance',
            scanType: 'ENTRY',
            status: 'DUPLICATE_ENTRY',
            notes: 'Visitor already inside venue',
          },
        });

        res.json({
          success: false,
          code: 'ALREADY_CHECKED_IN',
          message: `⚠️ ALREADY CHECKED IN! ${visitor.fullName} entered earlier.`,
          visitor,
        });
        return;
      }

      const updatedVisitor = await prisma.visitor.update({
        where: { id: visitor.id },
        data: {
          status: 'CHECKED_IN',
          checkedInAt: new Date(),
          GateLogs: {
            create: {
              gateName: `${gateName || 'Main Entrance'} (ENTRY)`,
              scannedById: req.user?.id,
              scanType: 'ENTRY',
              status: 'SUCCESS',
            },
          },
        },
      });

      res.json({
        success: true,
        code: 'VERIFIED',
        message: `✅ WELCOME! ${updatedVisitor.fullName} (${updatedVisitor.category}) - Entrance Pass Approved!`,
        visitor: updatedVisitor,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Recent Gate Audit Logs with search, filters, pagination, and count statistics
  static async getGateLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const scanType = (req.query.scanType as string) || '';
      const status = (req.query.status as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};

      if (scanType && scanType !== 'ALL') {
        where.scanType = scanType;
      }

      if (status && status !== 'ALL') {
        where.status = status;
      }

      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { gateName: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
          { visitor: { fullName: { contains: q, mode: 'insensitive' } } },
          { visitor: { badgeCode: { contains: q, mode: 'insensitive' } } },
          { visitor: { company: { contains: q, mode: 'insensitive' } } },
          { scannedBy: { name: { contains: q, mode: 'insensitive' } } },
          { scannedBy: { email: { contains: q, mode: 'insensitive' } } },
        ];
      }

      const [logs, total, totalEntry, totalExit, totalDenied] = await Promise.all([
        prisma.gateLog.findMany({
          where,
          orderBy: { scannedAt: 'desc' },
          skip,
          take: limit,
          include: {
            visitor: { select: { fullName: true, badgeCode: true, category: true, company: true } },
            scannedBy: { select: { name: true, email: true } },
          },
        }),
        prisma.gateLog.count({ where }),
        prisma.gateLog.count({ where: { scanType: 'ENTRY', status: 'SUCCESS' } }),
        prisma.gateLog.count({ where: { scanType: 'EXIT', status: 'SUCCESS' } }),
        prisma.gateLog.count({ where: { status: 'DENIED' } }),
      ]);

      res.json({
        success: true,
        logs,
        stats: {
          totalCheckIns: totalEntry,
          totalExits: totalExit,
          totalDenied,
          totalLogs: total,
        },
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
