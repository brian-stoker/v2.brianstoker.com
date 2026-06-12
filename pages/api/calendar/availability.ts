import { NextApiRequest, NextApiResponse } from 'next';
import { getCalendarClient, CALENDAR_ID } from '../lib/google-calendar';

const SLOT_START_HOUR = 10;
const SLOT_START_MINUTE = 30; // 10:30 AM
const SLOT_END_HOUR = 17;
const SLOT_END_MINUTE = 30; // 5:30 PM
const SLOT_DURATION = 30; // minutes

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
    // Parse as local midnight to avoid UTC-vs-local timezone off-by-one
    const parts = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!parts) {
      return res.status(400).json({ error: 'Invalid date format (use YYYY-MM-DD)' });
    }
    const selectedDate = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format (use YYYY-MM-DD)' });
    }

    // Skip if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    // Skip weekends
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.status(400).json({ error: 'Weekend dates are not available' });
    }

    const calendar = getCalendarClient();

    // Get all-day and timed events for the selected date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

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

    // Generate all 30-min slots from 10:30 AM to 5:30 PM
    const now = new Date();
    const slots: string[] = [];
    const slotDate = new Date(selectedDate);
    slotDate.setHours(SLOT_START_HOUR, SLOT_START_MINUTE, 0, 0);
    const endTime = new Date(selectedDate);
    endTime.setHours(SLOT_END_HOUR, SLOT_END_MINUTE, 0, 0);

    while (slotDate <= endTime) {
      const slotStart = new Date(slotDate);
        const slotEnd = new Date(slotDate);
        slotEnd.setMinutes(slotEnd.getMinutes() + SLOT_DURATION);

        // Check if slot overlaps with any busy time
        const isOverlap = busyTimes.some(
          (busy) => slotStart < busy.end && slotEnd > busy.start
        );

        // Exclude slots that have already started (matters for today)
        if (!isOverlap && slotStart > now) {
          slots.push(slotStart.toISOString());
        }

        slotDate.setMinutes(slotDate.getMinutes() + SLOT_DURATION);
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
