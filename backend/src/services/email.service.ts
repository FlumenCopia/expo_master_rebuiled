import nodemailer from 'nodemailer';
import { CalendarService } from './calendar.service';

export class EmailService {
  private static getTransporter() {
    // Falls back to Ethereal/console test log if SMTP env not present
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'demo@ethereal.email',
        pass: process.env.SMTP_PASS || 'demopass',
      },
    });
  }

  /**
   * Sends Welcome Email to registered Visitor with QR Badge details, page link & iCal (.ics) Calendar Invite
   */
  static async sendVisitorWelcomeEmail(visitor: {
    fullName: string;
    email: string;
    badgeCode: string;
    category?: string;
  }): Promise<boolean> {
    try {
      const calendarData = CalendarService.getDefaultExpoEvent();
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(visitor.badgeCode)}`;
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const badgePassUrl = `${frontendBaseUrl}/badge/${visitor.badgeCode}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #03151a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; border-bottom: 2px solid #7fee00; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #7fee00; margin: 0; font-size: 24px;">Masters Kerala RE 2.0 EXPO26</h1>
            <p style="color: #94a3b8; font-size: 15px; margin-top: 5px;">Registration Confirmed! Welcome, <strong>${visitor.fullName}</strong></p>
          </div>
          
          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <p style="color: #cbd5e1; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Digital Badge Code</p>
            <h2 style="color: #7fee00; font-size: 28px; margin: 5px 0; font-family: monospace;">${visitor.badgeCode}</h2>
            <img src="${qrApiUrl}" alt="QR Badge" style="width: 180px; height: 180px; margin: 15px 0; border: 4px solid #7fee00; border-radius: 8px; background: #fff; padding: 5px;" />
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px;">Show this QR code at Gate Entry scanners for instant entry.</p>
            
            <a href="${badgePassUrl}" target="_blank" style="background-color: #7fee00; color: #03151a; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(127,238,0,0.3);">
              💳 View & Print Digital Badge Pass Page
            </a>
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #ffffff; margin-top: 0; margin-bottom: 10px;">📅 Event Details & Add to Calendar</h4>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Date:</strong> Sept 25 - Sept 27, 2026</p>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Venue:</strong> Calicut Trade Centre, Kozhikode, Kerala</p>
            <div style="margin-top: 15px;">
              <a href="${calendarData.googleCalendarUrl}" target="_blank" style="background-color: #4285F4; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                📅 Add to Google Calendar
              </a>
            </div>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
            Masters EXPO26 Team • Support: info@solarmasters.org
          </p>
        </div>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: '"Masters EXPO26" <no-reply@solarmasters.org>',
        to: visitor.email,
        subject: `Pass Confirmed! Entry Pass & Badge: ${visitor.badgeCode} - Masters EXPO26`,
        html: htmlContent,
        icalEvent: {
          filename: 'expo26-invite.ics',
          method: 'REQUEST',
          content: calendarData.icsContent,
        },
      });

      console.log(`✉️ Visitor welcome email dispatched to ${visitor.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to dispatch visitor welcome email:', error);
      return false;
    }
  }

  /**
   * Sends Welcome Email to registered Exhibitor with event schedule & iCal (.ics) Calendar Invite
   */
  static async sendExhibitorWelcomeEmail(exhibitor: {
    companyName: string;
    contactPerson: string;
    email: string;
    stallNumber?: string;
  }): Promise<boolean> {
    try {
      const calendarData = CalendarService.getDefaultExpoEvent();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #03151a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; border-bottom: 2px solid #7fee00; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #7fee00; margin: 0; font-size: 24px;">Masters Kerala RE 2.0 EXPO26</h1>
            <p style="color: #94a3b8; font-size: 15px; margin-top: 5px;">Exhibitor Registration Received!</p>
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="color: #cbd5e1; font-size: 14px; margin-top: 0;">Dear <strong>${exhibitor.contactPerson}</strong> (${exhibitor.companyName}),</p>
            <p style="color: #94a3b8; font-size: 13.5px; line-height: 1.6;">
              Thank you for registering as an exhibitor at Masters Kerala RE 2.0 EXPO26. Your stall pre-booking request is being processed by our event management team.
            </p>
            ${exhibitor.stallNumber ? `<p style="color: #7fee00; font-size: 14px; font-weight: bold;">Assigned Stall: ${exhibitor.stallNumber}</p>` : ''}
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #ffffff; margin-top: 0; margin-bottom: 10px;">📅 Event Schedule & Calendar</h4>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Date:</strong> Sept 25 - Sept 27, 2026</p>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Venue:</strong> Calicut Trade Centre, Kozhikode, Kerala</p>
            <div style="margin-top: 15px;">
              <a href="${calendarData.googleCalendarUrl}" target="_blank" style="background-color: #4285F4; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                📅 Add to Google Calendar
              </a>
            </div>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
            Masters EXPO26 Team • Support: info@solarmasters.org
          </p>
        </div>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: '"Masters EXPO26" <no-reply@solarmasters.org>',
        to: exhibitor.email,
        subject: `Exhibitor Registration Received - Masters EXPO26`,
        html: htmlContent,
        icalEvent: {
          filename: 'expo26-invite.ics',
          method: 'REQUEST',
          content: calendarData.icsContent,
        },
      });

      console.log(`✉️ Exhibitor welcome email dispatched to ${exhibitor.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to dispatch exhibitor welcome email:', error);
      return false;
    }
  }

  /**
   * Auto-trigger Reminder Email to Visitor
   */
  static async sendVisitorReminderEmail(visitor: {
    fullName: string;
    email: string;
    badgeCode: string;
  }): Promise<boolean> {
    try {
      const calendarData = CalendarService.getDefaultExpoEvent();
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(visitor.badgeCode)}`;
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const badgePassUrl = `${frontendBaseUrl}/badge/${visitor.badgeCode}`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #03151a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; border-bottom: 2px solid #7fee00; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #7fee00; margin: 0; font-size: 24px;">Event Reminder: Masters EXPO26</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Hi ${visitor.fullName}, EXPO26 is approaching!</p>
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <p style="color: #cbd5e1; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Badge Code</p>
            <h2 style="color: #7fee00; font-size: 28px; margin: 5px 0; font-family: monospace;">${visitor.badgeCode}</h2>
            <img src="${qrApiUrl}" alt="QR Badge" style="width: 180px; height: 180px; margin: 15px 0; border: 4px solid #7fee00; border-radius: 8px; background: #fff; padding: 5px;" />
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px;">Keep this QR code ready for instant entry scanning.</p>
            
            <a href="${badgePassUrl}" target="_blank" style="background-color: #7fee00; color: #03151a; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
              💳 View Digital Badge Pass Page
            </a>
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #ffffff; margin-top: 0; margin-bottom: 10px;">📅 Event Date & Venue</h4>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Date:</strong> Sept 25 - Sept 27, 2026</p>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Venue:</strong> Calicut Trade Centre, Kozhikode, Kerala</p>
            <div style="margin-top: 15px;">
              <a href="${calendarData.googleCalendarUrl}" target="_blank" style="background-color: #4285F4; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                📅 Add to Google Calendar
              </a>
            </div>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
            Masters EXPO26 Team • Support: info@solarmasters.org
          </p>
        </div>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: '"Masters EXPO26" <no-reply@solarmasters.org>',
        to: visitor.email,
        subject: `Reminder: Masters Kerala RE 2.0 EXPO26 - Entry Badge ${visitor.badgeCode}`,
        html: htmlContent,
        icalEvent: {
          filename: 'expo26-reminder.ics',
          method: 'REQUEST',
          content: calendarData.icsContent,
        },
      });

      console.log(`✉️ Visitor reminder email sent to ${visitor.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send visitor reminder email:', error);
      return false;
    }
  }

  /**
   * Auto-trigger Reminder Email to Exhibitor
   */
  static async sendExhibitorReminderEmail(exhibitor: {
    companyName: string;
    contactPerson: string;
    email: string;
    stallNumber?: string;
  }): Promise<boolean> {
    try {
      const calendarData = CalendarService.getDefaultExpoEvent();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #03151a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; border-bottom: 2px solid #7fee00; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #7fee00; margin: 0; font-size: 24px;">Exhibitor Reminder: Masters EXPO26</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Dear ${exhibitor.contactPerson} (${exhibitor.companyName})</p>
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <p style="color: #cbd5e1; font-size: 14px; margin-top: 0;">We look forward to seeing your booth at Masters Kerala RE 2.0 EXPO26!</p>
            ${exhibitor.stallNumber ? `<p style="color: #7fee00; font-size: 14px; font-weight: bold;">Your Stall Number: ${exhibitor.stallNumber}</p>` : ''}
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #ffffff; margin-top: 0; margin-bottom: 10px;">📅 Event Date & Venue</h4>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Date:</strong> Sept 25 - Sept 27, 2026</p>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Venue:</strong> Calicut Trade Centre, Kozhikode, Kerala</p>
            <div style="margin-top: 15px;">
              <a href="${calendarData.googleCalendarUrl}" target="_blank" style="background-color: #4285F4; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                📅 Add to Google Calendar
              </a>
            </div>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
            Masters EXPO26 Team • Support: info@solarmasters.org
          </p>
        </div>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: '"Masters EXPO26" <no-reply@solarmasters.org>',
        to: exhibitor.email,
        subject: `Exhibitor Reminder: Masters Kerala RE 2.0 EXPO26`,
        html: htmlContent,
        icalEvent: {
          filename: 'expo26-reminder.ics',
          method: 'REQUEST',
          content: calendarData.icsContent,
        },
      });

      console.log(`✉️ Exhibitor reminder email sent to ${exhibitor.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send exhibitor reminder email:', error);
      return false;
    }
  }

  /**
   * Generic Campaign Email Dispatcher with Dynamic Template Placeholder Replacement
   */
  static async sendCustomCampaignEmail(data: {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    bodyContent: string;
    badgeCode?: string;
    companyName?: string;
  }): Promise<boolean> {
    try {
      const calendarData = CalendarService.getDefaultExpoEvent();
      const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const badgeCode = data.badgeCode || 'EXPO26-PASS';
      const badgePassUrl = `${frontendBaseUrl}/badge/${badgeCode}`;
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(badgeCode)}`;

      // Replace dynamic placeholders in subject and bodyContent
      let parsedSubject = data.subject
        .replace(/{{fullName}}/g, data.recipientName)
        .replace(/{{badgeCode}}/g, badgeCode)
        .replace(/{{companyName}}/g, data.companyName || '');

      let parsedBody = data.bodyContent
        .replace(/{{fullName}}/g, data.recipientName)
        .replace(/{{badgeCode}}/g, badgeCode)
        .replace(/{{companyName}}/g, data.companyName || '')
        .replace(/{{badgeUrl}}/g, badgePassUrl)
        .replace(/{{calendarUrl}}/g, calendarData.googleCalendarUrl);

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #03151a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; border-bottom: 2px solid #7fee00; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #7fee00; margin: 0; font-size: 24px;">Masters Kerala RE 2.0 EXPO26</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Dear ${data.recipientName}</p>
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; margin-bottom: 20px; line-height: 1.6; color: #e2e8f0; font-size: 14px;">
            ${parsedBody.replace(/\n/g, '<br />')}
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <p style="color: #cbd5e1; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Badge Access Code</p>
            <h2 style="color: #7fee00; font-size: 26px; margin: 5px 0; font-family: monospace;">${badgeCode}</h2>
            <img src="${qrApiUrl}" alt="QR Badge" style="width: 160px; height: 160px; margin: 12px 0; border: 3px solid #7fee00; border-radius: 8px; background: #fff; padding: 4px;" />
            <div style="margin-top: 12px;">
              <a href="${badgePassUrl}" target="_blank" style="background-color: #7fee00; color: #03151a; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13.5px; display: inline-block;">
                💳 View / Print Digital Badge Pass Page
              </a>
            </div>
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #ffffff; margin-top: 0; margin-bottom: 10px;">📅 Event Schedule & Add to Calendar</h4>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Date:</strong> Sept 25 - Sept 27, 2026</p>
            <p style="color: #cbd5e1; font-size: 13.5px; margin: 4px 0;"><strong>Venue:</strong> Calicut Trade Centre, Kozhikode, Kerala</p>
            <div style="margin-top: 15px;">
              <a href="${calendarData.googleCalendarUrl}" target="_blank" style="background-color: #4285F4; color: #ffffff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
                📅 Add to Google Calendar
              </a>
            </div>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
            Masters EXPO26 Team • Support: info@solarmasters.org
          </p>
        </div>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: '"Masters EXPO26" <no-reply@solarmasters.org>',
        to: data.recipientEmail,
        subject: parsedSubject,
        html: htmlContent,
        icalEvent: {
          filename: 'expo26-event.ics',
          method: 'REQUEST',
          content: calendarData.icsContent,
        },
      });

      console.log(`✉️ Campaign email dispatched to ${data.recipientEmail}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send campaign email to ${data.recipientEmail}:`, error);
      return false;
    }
  }
}
