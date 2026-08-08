import nodemailer from 'nodemailer';
import { CalendarService } from './calendar.service';

export class EmailService {
  private static getTransporter() {
    // Falls back to Ethereal/console test log if SMTP env not present
    return nodemailer.createTransport({
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'najil9645550205@gmail.com',
        pass: process.env.SMTP_PASS || 'lprd zpdg bjrl qivg',
      },
    });
  }

  private static getFromAddress(): string {
    return process.env.SMTP_FROM || `"Masters EXPO26" <${process.env.SMTP_USER || 'najil9645550205@gmail.com'}>`;
  }

  /**
   * Universal Enterprise HTML Email Template Wrapper with Expo Logo & Sleek Aesthetics
   */
  private static renderEmailWrapper(options: {
    title: string;
    subtitle?: string;
    badgeCode?: string;
    badgePassUrl?: string;
    qrApiUrl?: string;
    bodyHtml: string;
    showCalendarLink?: boolean;
  }): string {
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const logoUrl = `${frontendBaseUrl}/assets/logo/logo.png`;
    const calendarData = CalendarService.getDefaultExpoEvent();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${options.title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #020b0e; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; color: #f8fafc;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #020b0e; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" style="max-width: 620px; background-color: #04181d; border: 1px solid #0e3f49; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
                
                <!-- BRAND HEADER WITH LOGO -->
                <tr>
                  <td style="background: linear-gradient(135deg, #072e36 0%, #03151a 100%); padding: 30px 25px; text-align: center; border-bottom: 3px solid #7fee00;">
                    <img src="${logoUrl}" alt="Masters EXPO26 Logo" style="max-width: 190px; height: auto; display: block; margin: 0 auto 15px auto;" onError="this.style.display='none';" />
                    <h1 style="color: #7fee00; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                      Masters Kerala RE 2.0 EXPO26
                    </h1>
                    <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">
                      Ministry Approved Solar Traders • Kerala's Premier Renewable Energy Showcase
                    </p>
                  </td>
                </tr>

                <!-- MAIN CONTENT BODY -->
                <tr>
                  <td style="padding: 30px 25px;">
                    <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 10px 0; font-weight: 700;">${options.title}</h2>
                    ${options.subtitle ? `<p style="color: #7fee00; font-size: 14px; margin: 0 0 20px 0; font-weight: 600;">${options.subtitle}</p>` : ''}
                    
                    <div style="color: #cbd5e1; font-size: 14.5px; line-height: 1.65; margin-bottom: 25px;">
                      ${options.bodyHtml}
                    </div>

                    <!-- DIGITAL BADGE QR PASS CARD (If provided) -->
                    ${
                      options.badgeCode
                        ? `
                        <div style="background-color: #072830; border: 2px solid #7fee00; border-radius: 14px; padding: 25px; text-align: center; margin: 25px 0; box-shadow: 0 8px 24px rgba(127,238,0,0.15);">
                          <p style="color: #94a3b8; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 6px 0;">Official Digital Entry Badge Code</p>
                          <div style="color: #7fee00; font-size: 30px; font-weight: 900; font-family: 'Courier New', Courier, monospace; letter-spacing: 2px; margin: 4px 0 15px 0;">
                            ${options.badgeCode}
                          </div>
                          
                          ${
                            options.qrApiUrl
                              ? `
                              <div style="background-color: #ffffff; display: inline-block; padding: 10px; border-radius: 12px; border: 3px solid #7fee00; margin-bottom: 15px;">
                                <img src="${options.qrApiUrl}" alt="QR Entry Code" style="width: 180px; height: 180px; display: block;" />
                              </div>
                              `
                              : ''
                          }

                          <p style="color: #cbd5e1; font-size: 13px; margin: 0 0 18px 0;">
                            Show this QR code at Gate Scanners for instant fast-track venue entry.
                          </p>

                          ${
                            options.badgePassUrl
                              ? `
                              <a href="${options.badgePassUrl}" target="_blank" style="background-color: #7fee00; color: #020b0e; padding: 13px 26px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(127,238,0,0.4); border: 1px solid #a3ff33;">
                                💳 Open &amp; Print Digital Badge Pass Page
                              </a>
                              `
                              : ''
                          }
                        </div>
                        `
                        : ''
                    }

                    <!-- EVENT VENUE & CALENDAR DETAILS CARD -->
                    ${
                      options.showCalendarLink !== false
                        ? `
                        <div style="background-color: #062026; border: 1px solid #0e4854; border-radius: 12px; padding: 20px; margin-top: 25px;">
                          <h4 style="color: #ffffff; font-size: 15px; margin: 0 0 12px 0; font-weight: 700; display: flex; align-items: center;">
                            📅 Event Dates &amp; Venue
                          </h4>
                          <p style="color: #cbd5e1; font-size: 13.5px; margin: 5px 0;"><strong>Date:</strong> September 25 – September 27, 2026</p>
                          <p style="color: #cbd5e1; font-size: 13.5px; margin: 5px 0;"><strong>Venue:</strong> Calicut Trade Centre, Kozhikode, Kerala</p>
                          
                          <div style="margin-top: 15px;">
                            <a href="${calendarData.googleCalendarUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-block;">
                              📅 Add to Google Calendar
                            </a>
                          </div>
                        </div>
                        `
                        : ''
                    }
                  </td>
                </tr>

                <!-- FOOTER BRANDING -->
                <tr>
                  <td style="background-color: #020f12; padding: 25px; text-align: center; border-top: 1px solid #0a3139;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0; font-weight: 600;">
                      Masters EXPO26 • Ministry Approved Solar Traders Association
                    </p>
                    <p style="color: #64748b; font-size: 11.5px; margin: 0 0 12px 0;">
                      Support &amp; Inquiries: <a href="mailto:najil9645550205@gmail.com" style="color: #7fee00; text-decoration: none;">najil9645550205@gmail.com</a>
                    </p>
                    <p style="color: #475569; font-size: 10.5px; margin: 0;">
                      © 2026 Masters Kerala RE 2.0 EXPO26. All rights reserved. Calicut Trade Centre, Kozhikode.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
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

      const bodyHtml = `
        <p style="margin-top: 0;">Dear <strong>${visitor.fullName}</strong>,</p>
        <p>Your registration for <strong>Masters Kerala RE 2.0 EXPO26</strong> is successfully confirmed! We are thrilled to welcome you to Kerala's largest renewable energy event.</p>
        <p>Below is your official digital entry badge. You can present this QR code on your mobile phone or print your badge pass for instant gate entry.</p>
      `;

      const htmlContent = this.renderEmailWrapper({
        title: 'Registration Confirmed!',
        subtitle: `Welcome ${visitor.fullName}`,
        badgeCode: visitor.badgeCode,
        badgePassUrl,
        qrApiUrl,
        bodyHtml,
        showCalendarLink: true,
      });

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: this.getFromAddress(),
        to: visitor.email,
        subject: `Pass Confirmed! Entry Badge: ${visitor.badgeCode} - Masters EXPO26`,
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

      const bodyHtml = `
        <p style="margin-top: 0;">Dear <strong>${exhibitor.contactPerson}</strong> (${exhibitor.companyName}),</p>
        <p>Thank you for registering as an exhibitor at <strong>Masters Kerala RE 2.0 EXPO26</strong>.</p>
        <p>Your stall pre-booking application has been received and is currently being processed by our event coordination committee.</p>
        ${exhibitor.stallNumber ? `<div style="background-color: #072e36; padding: 12px 18px; border-radius: 8px; border-left: 4px solid #7fee00; margin: 15px 0;"><strong style="color: #7fee00;">Assigned Stall:</strong> ${exhibitor.stallNumber}</div>` : ''}
        <p>Our team will reach out shortly with setup guidelines and exhibitor badges.</p>
      `;

      const htmlContent = this.renderEmailWrapper({
        title: 'Exhibitor Registration Received!',
        subtitle: `Company: ${exhibitor.companyName}`,
        bodyHtml,
        showCalendarLink: true,
      });

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: this.getFromAddress(),
        to: exhibitor.email,
        subject: `Exhibitor Pre-Booking Confirmed - Masters EXPO26`,
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

      const bodyHtml = `
        <p style="margin-top: 0;">Hi <strong>${visitor.fullName}</strong>,</p>
        <p>This is a quick reminder that <strong>Masters Kerala RE 2.0 EXPO26</strong> is approaching fast! Get ready to explore state-of-the-art solar and renewable energy technologies.</p>
        <p>Please keep your digital badge code handy for smooth entrance at the scanners.</p>
      `;

      const htmlContent = this.renderEmailWrapper({
        title: 'Event Reminder: Masters EXPO26',
        subtitle: `Badge Pass: ${visitor.badgeCode}`,
        badgeCode: visitor.badgeCode,
        badgePassUrl,
        qrApiUrl,
        bodyHtml,
        showCalendarLink: true,
      });

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: this.getFromAddress(),
        to: visitor.email,
        subject: `Event Reminder: Masters Kerala RE 2.0 EXPO26 - Entry Pass ${visitor.badgeCode}`,
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

      const bodyHtml = `
        <p style="margin-top: 0;">Dear <strong>${exhibitor.contactPerson}</strong> (${exhibitor.companyName}),</p>
        <p>We are looking forward to hosting your exhibition booth at <strong>Masters Kerala RE 2.0 EXPO26</strong>.</p>
        ${exhibitor.stallNumber ? `<p style="color: #7fee00; font-weight: bold;">Your Stall Number: ${exhibitor.stallNumber}</p>` : ''}
        <p>Event setup instructions and gate badges have been updated. Please contact support if you require stall assistance.</p>
      `;

      const htmlContent = this.renderEmailWrapper({
        title: 'Exhibitor Reminder: Masters EXPO26',
        subtitle: `Booth: ${exhibitor.companyName}`,
        bodyHtml,
        showCalendarLink: true,
      });

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: this.getFromAddress(),
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

      const htmlContent = this.renderEmailWrapper({
        title: parsedSubject,
        subtitle: `Recipient: ${data.recipientName}`,
        badgeCode: data.badgeCode ? badgeCode : undefined,
        badgePassUrl: data.badgeCode ? badgePassUrl : undefined,
        qrApiUrl: data.badgeCode ? qrApiUrl : undefined,
        bodyHtml: parsedBody.replace(/\n/g, '<br />'),
        showCalendarLink: true,
      });

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: this.getFromAddress(),
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
