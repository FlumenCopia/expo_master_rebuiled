import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';
import { EmailService } from '../services/email.service';

export class CampaignController {
  /**
   * Get all email campaigns with statistics
   */
  static async getCampaigns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaigns = await prisma.emailCampaign.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
      const scheduledCount = campaigns.filter((c) => c.status === 'SCHEDULED').length;

      res.json({
        success: true,
        campaigns,
        stats: {
          totalCampaigns: campaigns.length,
          totalEmailsSent: totalSent,
          activeScheduled: scheduledCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Immediately trigger or create an email campaign
   */
  static async sendCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, subject, targetAudience, templateType, content, isScheduled, scheduledAt } = req.body;

      if (!title || !subject || !content) {
        res.status(400).json({ error: 'Title, subject, and content are required' });
        return;
      }

      const audience = targetAudience || 'VISITORS';
      const scheduledDate = isScheduled && scheduledAt ? new Date(scheduledAt) : null;
      const initialStatus = isScheduled ? 'SCHEDULED' : 'IN_PROGRESS';

      // 1. Create campaign record
      const campaign = await prisma.emailCampaign.create({
        data: {
          title,
          subject,
          targetAudience: audience,
          templateType: templateType || 'CUSTOM',
          content,
          status: initialStatus,
          scheduledAt: scheduledDate,
        },
      });

      if (isScheduled) {
        res.json({
          success: true,
          message: `Campaign "${title}" successfully scheduled for ${scheduledDate?.toISOString()}`,
          campaign,
        });
        return;
      }

      // 2. Fetch target audience recipients
      let recipients: Array<{ email: string; name: string; badgeCode?: string; companyName?: string }> = [];

      if (audience === 'VISITORS' || audience === 'ALL') {
        const visitors = await prisma.visitor.findMany({
          where: { email: { not: { endsWith: '@expokerala.local' } } },
        });
        visitors.forEach((v) => {
          if (v.email) {
            recipients.push({
              email: v.email,
              name: v.fullName,
              badgeCode: v.badgeCode,
              companyName: v.company || undefined,
            });
          }
        });
      }

      if (audience === 'EXHIBITORS' || audience === 'ALL') {
        const exhibitors = await prisma.exhibitor.findMany();
        exhibitors.forEach((ex) => {
          if (ex.email) {
            recipients.push({
              email: ex.email,
              name: ex.contactPerson,
              companyName: ex.companyName,
            });
          }
        });
      }

      // Update total recipients
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { totalRecipients: recipients.length },
      });

      // 3. Dispatch batch emails asynchronously in background
      (async () => {
        let sentCount = 0;
        let failedCount = 0;

        for (const recipient of recipients) {
          const success = await EmailService.sendCustomCampaignEmail({
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            subject: campaign.subject,
            bodyContent: campaign.content,
            badgeCode: recipient.badgeCode,
            companyName: recipient.companyName,
          });

          if (success) sentCount++;
          else failedCount++;
        }

        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: {
            status: 'COMPLETED',
            sentAt: new Date(),
            sentCount,
            failedCount,
          },
        });

        console.log(`🚀 Campaign "${campaign.title}" completed. Sent: ${sentCount}, Failed: ${failedCount}`);
      })().catch((err) => console.error('Campaign background error:', err));

      res.json({
        success: true,
        message: `Campaign "${title}" initiated for ${recipients.length} recipients in the background.`,
        campaign,
        totalRecipients: recipients.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send Test Email to specified admin email
   */
  static async sendTestEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { testEmail, subject, content } = req.body;

      if (!testEmail || !subject || !content) {
        res.status(400).json({ error: 'testEmail, subject, and content are required' });
        return;
      }

      const success = await EmailService.sendCustomCampaignEmail({
        recipientEmail: testEmail,
        recipientName: 'Admin Tester',
        subject: `[TEST PREVIEW] ${subject}`,
        bodyContent: content,
        badgeCode: 'EXPO26-TEST',
        companyName: 'Test Solar Energy Ltd',
      });

      if (!success) {
        res.status(500).json({ error: 'Failed to send test email. Check SMTP configuration.' });
        return;
      }

      res.json({ success: true, message: `Test email sent to ${testEmail}` });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete / Cancel a campaign
   */
  static async deleteCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.emailCampaign.delete({ where: { id } });
      res.json({ success: true, message: 'Campaign record deleted' });
    } catch (error) {
      next(error);
    }
  }
}
