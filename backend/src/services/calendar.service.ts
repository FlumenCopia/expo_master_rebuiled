/**
 * Calendar Service for generating iCalendar (.ics) files and Add-to-Calendar web links.
 */

export interface CalendarEventOptions {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  organizerName?: string;
  organizerEmail?: string;
}

export class CalendarService {
  /**
   * Generates standard RFC 5545 iCalendar (.ics) content string
   */
  static generateICS(options: CalendarEventOptions): string {
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    const now = formatDate(new Date());
    const start = formatDate(options.startTime);
    const end = formatDate(options.endTime);

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Masters EXPO26//Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:expo26-${Date.now()}@mastersexpo.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${options.title}`,
      `DESCRIPTION:${options.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${options.location}`,
      `ORGANIZER;CN=${options.organizerName || 'Masters EXPO26'}:mailto:${options.organizerEmail || 'info@mastersexpo.com'}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  /**
   * Generates Google Calendar web link
   */
  static getGoogleCalendarUrl(options: CalendarEventOptions): string {
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
    const dates = `${formatDate(options.startTime)}/${formatDate(options.endTime)}`;
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: options.title,
      dates: dates,
      details: options.description,
      location: options.location,
    });
    return `${baseUrl}&${params.toString()}`;
  }

  /**
   * Default Expo Event Calendar Details
   */
  static getDefaultExpoEvent() {
    const startDate = new Date('2026-09-25T09:00:00+05:30');
    const endDate = new Date('2026-09-27T18:00:00+05:30');

    const options: CalendarEventOptions = {
      title: 'Masters Kerala RE 2.0 EXPO26',
      description: 'Official Registration Confirmation for Masters Kerala RE 2.0 EXPO26. Show your badge pass at the venue entrance scanner.',
      location: 'Calicut Trade Centre, Kozhikode, Kerala, India',
      startTime: startDate,
      endTime: endDate,
      organizerName: 'Masters EXPO Team',
      organizerEmail: 'info@solarmasters.org',
    };

    return {
      options,
      icsContent: this.generateICS(options),
      googleCalendarUrl: this.getGoogleCalendarUrl(options),
    };
  }
}
