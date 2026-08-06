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
      const visitor = await prisma.visitor.findUnique({ where: { badgeCode: cleanCode } });

      if (!visitor) {
        res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          message: '❌ Invalid Badge! Visitor record not found.',
        });
        return;
      }

      // --- BREAK / PASS-OUT MODE ---
      if (mode === 'BREAK') {
        if (visitor.status !== 'CHECKED_IN') {
          res.json({
            success: false,
            code: 'NOT_INSIDE',
            message: `⚠️ CANNOT PASS-OUT! ${visitor.fullName} is not currently inside the venue.`,
            visitor,
          });
          return;
        }

        const updatedVisitor = await prisma.visitor.update({
          where: { id: visitor.id },
          data: {
            status: 'ON_BREAK' as any,
            GateLogs: { create: { gateName: `${gateName} (BREAK EXIT)`, scannedById: req.user?.id } },
          },
        });

        res.json({
          success: true,
          code: 'ON_BREAK',
          message: `☕ BREAK APPROVED! ${updatedVisitor.fullName} checked out for a break.`,
          visitor: updatedVisitor,
        });
        return;
      }

      // --- RE-ENTRY MODE ---
      if (mode === 'RE_ENTRY') {
        if (visitor.status === 'CHECKED_IN') {
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
            GateLogs: { create: { gateName: `${gateName} (RE-ENTRY)`, scannedById: req.user?.id } },
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

      // --- FINAL EXIT MODE ---
      if (mode === 'OUT') {
        if (visitor.status === 'REGISTERED' || visitor.status === ('CHECKED_OUT' as any)) {
          res.json({
            success: false,
            code: 'NOT_CHECKED_IN',
            message: `⚠️ NOT CHECKED IN! ${visitor.fullName} has not entered the venue.`,
            visitor,
          });
          return;
        }

        const updatedVisitor = await prisma.visitor.update({
          where: { id: visitor.id },
          data: {
            status: 'CHECKED_OUT' as any,
            GateLogs: { create: { gateName: `${gateName} (FINAL EXIT)`, scannedById: req.user?.id } },
          },
        });

        res.json({
          success: true,
          code: 'CHECKED_OUT',
          message: `👋 GOODBYE! ${updatedVisitor.fullName} (${updatedVisitor.category}) - Final Exit Approved!`,
          visitor: updatedVisitor,
        });
        return;
      }

      // --- ENTRY / CHECK-IN MODE (Default) ---
      // Smart Re-entry detection if visitor was on break
      if (visitor.status === ('ON_BREAK' as any)) {
        const updatedVisitor = await prisma.visitor.update({
          where: { id: visitor.id },
          data: {
            status: 'CHECKED_IN',
            GateLogs: { create: { gateName: `${gateName} (RE-ENTRY FROM BREAK)`, scannedById: req.user?.id } },
          },
        });

        res.json({
          success: true,
          code: 'VERIFIED',
          message: `👋 WELCOME BACK! ${updatedVisitor.fullName} (${updatedVisitor.category}) returned from break. Pass Approved!`,
          visitor: updatedVisitor,
        });
        return;
      }

      if (visitor.status === 'CHECKED_IN') {
        res.json({
          success: false,
          code: 'ALREADY_CHECKED_IN',
          message: `⚠️ ALREADY CHECKED IN! ${visitor.fullName} entered at ${
            visitor.checkedInAt ? new Date(visitor.checkedInAt).toLocaleTimeString() : 'earlier'
          }.`,
          visitor,
        });
        return;
      }

      const updatedVisitor = await prisma.visitor.update({
        where: { id: visitor.id },
        data: {
          status: 'CHECKED_IN',
          checkedInAt: new Date(),
          GateLogs: { create: { gateName: `${gateName} (ENTRY)`, scannedById: req.user?.id } },
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
}
