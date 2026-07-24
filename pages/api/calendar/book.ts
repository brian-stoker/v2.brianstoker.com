import { NextApiRequest, NextApiResponse } from 'next';
import { getCalendarClient, CALENDAR_ID } from '../lib/google-calendar';
import { BUSINESS_TIMEZONE } from '../lib/business-hours';

interface BookingRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  reason?: string;
  startTime?: string;
  durationMinutes?: number;
  inviteEmails?: string[];
}

type ResponseData = {
  eventId?: string;
  eventLink?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, company, reason, startTime, durationMinutes, inviteEmails } =
    req.body as BookingRequest;

  // Validate required fields
  if (!name || !email || !phone || !reason) {
    return res.status(400).json({ error: 'Missing required fields: name, email, phone, reason' });
  }

  // Validate any invitee emails before building the event
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invitees = Array.isArray(inviteEmails)
    ? inviteEmails.map((e) => String(e).trim()).filter(Boolean)
    : [];
  if (invitees.some((e) => !emailRe.test(e))) {
    return res.status(400).json({ error: 'One or more invite emails are invalid' });
  }

  if (!startTime || typeof startTime !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid startTime' });
  }

  if (!durationMinutes || typeof durationMinutes !== 'number' || durationMinutes <= 0) {
    return res.status(400).json({ error: 'Invalid durationMinutes (must be > 0)' });
  }

  // Validate duration is a multiple of 15
  if (durationMinutes % 15 !== 0) {
    return res.status(400).json({ error: 'Duration must be a multiple of 15 minutes' });
  }

  try {
    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: 'Invalid startTime format (use ISO 8601)' });
    }

    // Prevent booking in the past
    if (startDate < new Date()) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);

    // Build event description with form data
    const description = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      company ? `Company: ${company}` : '',
      reason ? `Reason: ${reason}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const calendar = getCalendarClient();

    const event = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: `Appointment: ${name}`,
        description,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: BUSINESS_TIMEZONE,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: BUSINESS_TIMEZONE,
        },
        attendees: [
          {
            email: email!,
            displayName: name || undefined,
          },
          ...invitees
            .filter((e) => e.toLowerCase() !== email!.toLowerCase())
            .map((e) => ({ email: e })),
        ],
      },
    });

    const eventId = event.data.id || '';
    if (!eventId) {
      return res.status(500).json({ error: 'Failed to create appointment: no event ID returned' });
    }

    const eventLink = `https://calendar.google.com/calendar/u/0/r/eventedit/${eventId}`;

    return res.status(200).json({
      eventId,
      eventLink,
    });
  } catch (error) {
    console.error('Calendar booking error:', error);
    if (error instanceof Error && error.message.includes('GOOGLE_CALENDAR_SERVICE_ACCOUNT')) {
      return res.status(401).json({ error: 'Calendar credentials not configured' });
    }
    return res.status(500).json({ error: 'Failed to create appointment' });
  }
}
