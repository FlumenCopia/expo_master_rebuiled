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
   * Sends Welcome Email to registered Visitor with QR Badge details & iCal (.ics) Calendar Invite
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

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #03151a; color: #ffffff; padding: 30px; border-radius: 12px;">
          <div style="text-align: center; border-bottom: 2px solid #7fee00; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #7fee00; margin: 0;">Masters EXPO26 Pass Confirmed!</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Welcome, ${visitor.fullName}</p>
          </div>
          
          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <p style="color: #cbd5e1; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Your Digital Badge Code</p>
            <h2 style="color: #7fee00; font-size: 28px; margin: 5px 0; font-family: monospace;">${visitor.badgeCode}</h2>
            <img src="${qrApiUrl}" alt="QR Badge" style="width: 180px; height: 180px; margin: 15px 0; border: 4px solid #7fee00; border-radius: 8px; background: #fff; padding: 5px;" />
            <p style="color: #94a3b8; font-size: 13px;">Show this QR code at Gate Entry scanners for instant entry.</p>
          </div>

          <div style="background-color: #072228; border: 1px solid #0b3d46; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <h4 style="color: #ffffff; margin-top: 0; margin-bottom: 10px;">📅 Event Schedule & Add to Calendar</h4>
            <p style="color: #cbd5e1; font-size: 13px; margin: 3px 0;"><strong>Date:</strong> Sept 15 - Sept 17, 2026</p>
            <p style="color: #cbd5e1; font-size: 13px; margin: 3px 0;"><strong>Venue:</strong> Main Exhibition Centre, Kochi, Kerala</p>
            <div style="margin-top: 15px;">
              <a href="${calendarData.googleCalendarUrl}" target="_blank" style="background-color: #7fee00; color: #03151a; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block; margin-right: 10px;">Add to Google Calendar</a>
            </div>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 30px;">
            Masters EXPO26 Team • Support: info@mastersexpo.com
          </p>
        </div>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: '"Masters EXPO26" <no-reply@mastersexpo.com>',
        to: visitor.email,
        subject: `Your Entry Pass & Badge Code: ${visitor.badgeCode} - Masters EXPO26`,
        html: htmlContent,
        icalEvent: {
          filename: 'expo26-invite.ics',
          method: 'REQUEST',
          content: calendarData.icsContent,
        },
      });

      console.log(`✉️ Welcome email dispatched to ${visitor.email} with QR & Calendar invite.`);
      return true;
    } catch (error) {
      console.error('❌ Failed to dispatch visitor welcome email:', error);
      return false;
    }
  }
}
