import { NextApiRequest, NextApiResponse } from 'next';
import { getCalendarClient, CALENDAR_ID } from '../lib/google-calendar';
import {
  getBusinessHourSlots,
  businessWallClockToUtc,
  businessTodayDateStr,
  SLOT_DURATION_MINUTES,
} from '../lib/business-hours';

type ResponseData = {
  slots?: string[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { date } = req.query;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid date query parameter (YYYY-MM-DD)' });
  }

  try {
    const parts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!parts) {
      return res.status(400).json({ error: 'Invalid date format (use YYYY-MM-DD)' });
    }

    // Past-date check by calendar date in the business timezone (server TZ irrelevant)
    if (date < businessTodayDateStr()) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    // Weekend check on the calendar date itself
    const dayOfWeek = new Date(Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))).getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ error: 'Weekend dates are not available' });
    }

    const calendar = getCalendarClient();

    // Busy window spans the full business-timezone day
    const startOfDay = businessWallClockToUtc(date, 0, 0);
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const calendarResponse = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = calendarResponse.data.items || [];

    // Build list of busy times from events
    const busyTimes: Array<{ start: Date; end: Date }> = [];
    for (const event of events) {
      if (event.start && event.end) {
        busyTimes.push({
          start: new Date(event.start.dateTime || event.start.date!),
          end: new Date(event.end.dateTime || event.end.date!),
        });
      }
    }

    // Business-hour slot instants, filtered for busy overlap and already-started slots
    const now = new Date();
    const slots: string[] = [];
    for (const iso of getBusinessHourSlots(date)) {
      const slotStart = new Date(iso);
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

      const isOverlap = busyTimes.some(
        (busy) => slotStart < busy.end && slotEnd > busy.start
      );

      if (!isOverlap && slotStart > now) {
        slots.push(iso);
      }
    }

    return res.status(200).json({ slots });
  } catch (error) {
    console.error('Calendar availability error:', error);
    if (error instanceof Error && error.message.includes('GOOGLE_CALENDAR_SERVICE_ACCOUNT')) {
      return res.status(401).json({ error: 'Calendar credentials not configured' });
    }
    return res.status(500).json({ error: 'Failed to fetch availability' });
  }
}
