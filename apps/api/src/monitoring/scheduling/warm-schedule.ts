import type { WarmSchedule } from '../../database';

type LocalTime = {
  year: number;
  month: number;
  day: number;
  weekday: number;
  minutes: number;
};

const MINUTE = 60_000;
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string) {
  let format = formatters.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    formatters.set(timeZone, format);
  }
  return format;
}

function localTime(date: Date, timeZone: string): LocalTime {
  const parts = Object.fromEntries(
    formatter(timeZone)
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: weekdays.indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

function offsetMs(utcMs: number, timeZone: string) {
  const local = localTime(new Date(utcMs), timeZone);
  const asUtc = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    0,
    local.minutes,
  );
  return asUtc - Math.floor(utcMs / MINUTE) * MINUTE;
}

// Wall-clock time in a zone to an instant. The second pass corrects for a DST
// change between the guess and the answer.
function zonedToUtc(
  year: number,
  month: number,
  day: number,
  minutes: number,
  timeZone: string,
) {
  const wall = Date.UTC(year, month - 1, day, 0, minutes);
  let utc = wall - offsetMs(wall, timeZone);
  const corrected = wall - offsetMs(utc, timeZone);
  if (corrected !== utc) utc = corrected;
  return new Date(utc);
}

export function parseTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isWithinWindow(
  schedule: WarmSchedule,
  timeZone: string,
  at: Date,
) {
  const local = localTime(at, timeZone);
  return (
    schedule.days.includes(local.weekday) &&
    local.minutes >= parseTime(schedule.startTime) &&
    local.minutes < parseTime(schedule.endTime)
  );
}

export function nextWindowStart(
  schedule: WarmSchedule,
  timeZone: string,
  after: Date,
): Date | null {
  const today = localTime(after, timeZone);
  const startMinutes = parseTime(schedule.startTime);

  for (let offset = 0; offset <= 7; offset++) {
    const date = new Date(
      Date.UTC(today.year, today.month - 1, today.day + offset),
    );
    if (!schedule.days.includes(date.getUTCDay())) continue;

    const start = zonedToUtc(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      startMinutes,
      timeZone,
    );
    if (start > after) return start;
  }
  return null;
}

export type SchedulablePolicy = {
  mode: 'interval' | 'schedule' | 'manual';
  intervalMinutes: number | null;
  timezone: string;
  schedule: WarmSchedule | null;
};

export const DEFAULT_INTERVAL_MINUTES = 10;

export function nextRunAt(policy: SchedulablePolicy, now: Date): Date | null {
  if (policy.mode === 'manual') return null;

  const interval = policy.intervalMinutes ?? DEFAULT_INTERVAL_MINUTES;
  const candidate = new Date(now.getTime() + interval * MINUTE);
  if (policy.mode === 'interval' || !policy.schedule) return candidate;

  return isWithinWindow(policy.schedule, policy.timezone, candidate)
    ? candidate
    : nextWindowStart(policy.schedule, policy.timezone, now);
}
