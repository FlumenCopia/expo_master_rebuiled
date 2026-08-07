import { prisma } from '../lib/prisma';
import { EmailService } from './email.service';

export class SchedulerService {
  private static timerId: NodeJS.Timeout | null = null;

  /**
   * Initialize background task runner (checks every 60 seconds for due scheduled campaigns)
   */
  static initScheduler() {
    if (this.timerId) return;

    console.log('⏰ Scheduled Email Campaign Engine initialized.');

    // Run check immediately on boot
    this.checkAndProcessScheduledCampaigns().catch((err) =>
      console.error('Scheduler initial execution error:', err)
    );

    // Schedule periodic execution every 60 seconds
    this.timerId = setInterval(() => {
      this.checkAndProcessScheduledCampaigns().catch((err) =>
        console.error('Scheduler periodic execution error:', err)
      );
    }, 60 * 1000);
  }

  /**
   * Checks database for scheduled campaigns due for dispatch
   */
  static async checkAndProcessScheduledCampaigns() {
    try {
      const now = new Date();
      let dueCampaigns: any[] = [];

      try {
        dueCampaigns = await prisma.emailCampaign.findMany({
          where: {
            status: 'SCHEDULED',
            scheduledAt: { lte: now },
          },
        });
      } catch {
        // Handle serverless PostgreSQL connection reset gracefully
        await prisma.$connect().catch(() => {});
        dueCampaigns = await prisma.emailCampaign.findMany({
          where: {
            status: 'SCHEDULED',
            scheduledAt: { lte: now },
          },
        }).catch(() => []);
      }

      if (dueCampaigns.length === 0) return;

      console.log(`⏰ Found ${dueCampaigns.length} scheduled email campaign(s) due for execution.`);

      for (const campaign of dueCampaigns) {
        // Mark in progress
        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { status: 'IN_PROGRESS' },
        });

        // Gather recipients
        let recipients: Array<{ email: string; name: string; badgeCode?: string; companyName?: string }> = [];

        if (campaign.targetAudience === 'VISITORS' || campaign.targetAudience === 'ALL') {
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

        if (campaign.targetAudience === 'EXHIBITORS' || campaign.targetAudience === 'ALL') {
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

        await prisma.emailCampaign.update({
          where: { id: campaign.id },
          data: { totalRecipients: recipients.length },
        });

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

        console.log(`✅ Scheduled Campaign "${campaign.title}" successfully dispatched to ${sentCount} recipient(s).`);
      }
    } catch (error) {
      console.error('❌ Scheduler error processing campaigns:', error);
    }
  }
}
