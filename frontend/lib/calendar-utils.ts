/**
 * Utility functions for generating iCalendar (.ics) files for native device calendars
 * and Google Calendar web link templates.
 */

export interface ExpoEventDetails {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
}

export const DEFAULT_EXPO_EVENT: ExpoEventDetails = {
  title: 'Masters Kerala RE 2.0 EXPO26',
  description: 'Official Registration Confirmation for Masters Kerala RE 2.0 EXPO26 - Kerala\'s Premier Renewable Energy Exhibition. Show your badge pass at venue scanners.',
  location: 'Calicut Trade Centre, Kozhikode, Kerala, India',
  startDate: new Date('2026-09-25T09:00:00+05:30'),
  endDate: new Date('2026-09-27T18:00:00+05:30'),
};

/**
 * Triggers native 1-tap iCalendar (.ics) file download/launch for iOS Apple Calendar, Android, Windows & Mac native calendars.
 */
export function downloadIcsFile(event: ExpoEventDetails = DEFAULT_EXPO_EVENT) {
  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
  const now = formatDate(new Date());
  const start = formatDate(event.startDate);
  const end = formatDate(event.endDate);

  const icsLines = [
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
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Masters_EXPO26_Event.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generates Google Calendar web application template URL.
 */
export function getGoogleCalendarUrl(event: ExpoEventDetails = DEFAULT_EXPO_EVENT): string {
  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
  const dates = `${formatDate(event.startDate)}/${formatDate(event.endDate)}`;
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: event.title,
    dates: dates,
    details: event.description,
    location: event.location,
  });
  return `${baseUrl}&${params.toString()}`;
}
