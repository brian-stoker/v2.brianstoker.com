// Business hours for the booking flow, pinned to a fixed timezone so the API
// produces identical instants on any server (local dev vs UTC Lambda).

export const BUSINESS_TIMEZONE = 'America/Chicago';

export const SLOT_START_HOUR = 10;
export const SLOT_START_MINUTE = 30; // 10:30 AM
export const SLOT_END_HOUR = 17;
export const SLOT_END_MINUTE = 30; // 5:30 PM
export const SLOT_DURATION_MINUTES = 30;

const wallClockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BUSINESS_TIMEZONE,
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

// Offset (ms) of BUSINESS_TIMEZONE from UTC at the given instant (negative west of UTC)
function timezoneOffsetMs(instant: Date): number {
  const parts: Record<string, number> = {};
  for (const p of wallClockFormatter.formatToParts(instant)) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  const asUtc = Date.UTC(
    parts.year, parts.month - 1, parts.day,
    parts.hour % 24, parts.minute, parts.second,
  );
  return asUtc - instant.getTime();
}

// UTC instant for a wall-clock time in BUSINESS_TIMEZONE on the given day
export function businessWallClockToUtc(
  dateStr: string,
  hour: number,
  minute: number,
): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const naive = Date.UTC(y, m - 1, d, hour, minute, 0, 0);
  // Two passes converge across DST transitions
  let utc = naive - timezoneOffsetMs(new Date(naive));
  utc = naive - timezoneOffsetMs(new Date(utc));
  return new Date(utc);
}

// All business-hour slot start instants (ISO) for a YYYY-MM-DD day
export function getBusinessHourSlots(dateStr: string): string[] {
  const slots: string[] = [];
  const startMinutes = SLOT_START_HOUR * 60 + SLOT_START_MINUTE;
  const endMinutes = SLOT_END_HOUR * 60 + SLOT_END_MINUTE;
  for (let mins = startMinutes; mins <= endMinutes; mins += SLOT_DURATION_MINUTES) {
    slots.push(
      businessWallClockToUtc(dateStr, Math.floor(mins / 60), mins % 60).toISOString(),
    );
  }
  return slots;
}

// Today's calendar date (YYYY-MM-DD) in BUSINESS_TIMEZONE
export function businessTodayDateStr(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
