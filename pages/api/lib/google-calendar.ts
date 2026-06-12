import { google } from 'googleapis';
import type { calendar_v3 } from 'googleapis';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedAuth: any = null;

export function getGoogleCalendarAuth() {
  if (cachedAuth) {
    return cachedAuth;
  }

  const serviceAccountJson = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_CALENDAR_SERVICE_ACCOUNT env var not set');
  }

  const serviceAccount = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key: string;
  };

  cachedAuth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
    subject: 'brian@stokd.cloud',
  });

  return cachedAuth;
}

export function getCalendarClient(): calendar_v3.Calendar {
  const auth = getGoogleCalendarAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return google.calendar({ version: 'v3', auth }) as any as calendar_v3.Calendar;
}

export const CALENDAR_ID = 'brian@stokd.cloud';
