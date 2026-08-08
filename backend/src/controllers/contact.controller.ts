import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { EmailService } from '../services/email.service';

export class ContactController {
  /**
   * Public Contact Form Submission (POST /api/contact)
   */
  static async submitContactForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !message) {
        res.status(400).json({ error: 'Name, email, and message are required fields' });
        return;
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanName = String(name).trim();
      const cleanMessage = String(message).trim();

      // 1. Save to Database
      const enquiry = await (prisma as any).contactEnquiry.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          phone: phone ? String(phone).trim() : null,
          subject: subject ? String(subject).trim() : 'General Expo Enquiry',
          message: cleanMessage,
          status: 'NEW',
        },
      });

      // 2. Dispatch Auto-Confirmation Email via Gmail SMTP
      EmailService.sendCustomCampaignEmail({
        recipientEmail: cleanEmail,
        recipientName: cleanName,
        subject: `We Received Your Message - Masters EXPO26`,
        bodyContent: `Thank you for reaching out to Masters EXPO26 team!\n\nWe have received your message regarding "${subject || 'General Enquiry'}" and our event management team will get back to you shortly.\n\nYour Submitted Message:\n"${cleanMessage}"`,
      }).catch((err) => console.error('Contact auto-reply email error:', err));

      res.status(201).json({
        success: true,
        message: 'Your message has been received! Our team will contact you shortly.',
        enquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Get Contact Enquiries (GET /api/admin/contact-enquiries)
   */
  static async getContactEnquiries(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || '';
      const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
      const limit = Math.min(100, Math.max(10, parseInt((req.query.limit as string) || '25', 10)));
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status && status !== 'ALL') where.status = status;
      if (search.trim() !== '') {
        const q = search.trim();
        where.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { subject: { contains: q, mode: 'insensitive' } },
          { message: { contains: q, mode: 'insensitive' } },
        ];
      }

      const [enquiries, totalCount, newCount, contactedCount, resolvedCount] = await Promise.all([
        (prisma as any).contactEnquiry.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        (prisma as any).contactEnquiry.count({ where }),
        (prisma as any).contactEnquiry.count({ where: { status: 'NEW' } }).catch(() => 0),
        (prisma as any).contactEnquiry.count({ where: { status: 'CONTACTED' } }).catch(() => 0),
        (prisma as any).contactEnquiry.count({ where: { status: 'RESOLVED' } }).catch(() => 0),
      ]);

      res.json({
        success: true,
        enquiries,
        stats: {
          total: totalCount,
          newCount,
          contactedCount,
          resolvedCount,
        },
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(totalCount / limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Update Enquiry Status (PUT /api/admin/contact-enquiries/:id)
   */
  static async updateEnquiryStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updated = await (prisma as any).contactEnquiry.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
      });

      res.json({ success: true, enquiry: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin Delete Enquiry (DELETE /api/admin/contact-enquiries/:id)
   */
  static async deleteEnquiry(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await (prisma as any).contactEnquiry.delete({ where: { id } });
      res.json({ success: true, message: 'Contact enquiry record deleted' });
    } catch (error) {
      next(error);
    }
  }
}
