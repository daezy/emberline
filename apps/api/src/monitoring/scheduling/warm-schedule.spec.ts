import { isWithinWindow, nextRunAt, nextWindowStart } from './warm-schedule';

const weekdays = {
  days: [1, 2, 3, 4, 5],
  startTime: '08:00',
  endTime: '22:00',
};

describe('isWithinWindow', () => {
  it('uses the policy timezone, not UTC', () => {
    // Monday 07:30 UTC is 08:30 in Lagos (UTC+1).
    const at = new Date('2026-09-21T07:30:00Z');
    expect(isWithinWindow(weekdays, 'Africa/Lagos', at)).toBe(true);
    expect(isWithinWindow(weekdays, 'UTC', at)).toBe(false);
  });

  it('excludes the end time and unlisted days', () => {
    expect(
      isWithinWindow(weekdays, 'UTC', new Date('2026-09-21T22:00:00Z')),
    ).toBe(false);
    // Saturday.
    expect(
      isWithinWindow(weekdays, 'UTC', new Date('2026-09-26T12:00:00Z')),
    ).toBe(false);
  });
});

describe('nextWindowStart', () => {
  it('returns later today when before the window', () => {
    const next = nextWindowStart(
      weekdays,
      'Africa/Lagos',
      new Date('2026-09-21T05:00:00Z'),
    );
    expect(next?.toISOString()).toBe('2026-09-21T07:00:00.000Z');
  });

  it('skips the weekend', () => {
    const next = nextWindowStart(
      weekdays,
      'UTC',
      new Date('2026-09-25T23:00:00Z'),
    );
    expect(next?.toISOString()).toBe('2026-09-28T08:00:00.000Z');
  });

  it('follows DST changes', () => {
    // New York moves from EDT (UTC-4) to EST (UTC-5) on 1 November 2026.
    const everyday = {
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: '09:00',
      endTime: '17:00',
    };
    const before = nextWindowStart(
      everyday,
      'America/New_York',
      new Date('2026-10-31T20:00:00Z'),
    );
    const after = nextWindowStart(
      everyday,
      'America/New_York',
      new Date('2026-11-01T20:00:00Z'),
    );
    expect(before?.toISOString()).toBe('2026-11-01T14:00:00.000Z');
    expect(after?.toISOString()).toBe('2026-11-02T14:00:00.000Z');
  });
});

describe('nextRunAt', () => {
  const now = new Date('2026-09-21T12:00:00Z');

  it('adds the interval', () => {
    const next = nextRunAt(
      {
        mode: 'interval',
        intervalMinutes: 15,
        timezone: 'UTC',
        schedule: null,
      },
      now,
    );
    expect(next?.toISOString()).toBe('2026-09-21T12:15:00.000Z');
  });

  it('jumps to the next window when the interval would leave it', () => {
    const next = nextRunAt(
      {
        mode: 'schedule',
        intervalMinutes: 30,
        timezone: 'UTC',
        schedule: { days: [1], startTime: '11:00', endTime: '12:15' },
      },
      now,
    );
    expect(next?.toISOString()).toBe('2026-09-28T11:00:00.000Z');
  });

  it('never schedules manual policies', () => {
    expect(
      nextRunAt(
        {
          mode: 'manual',
          intervalMinutes: 10,
          timezone: 'UTC',
          schedule: null,
        },
        now,
      ),
    ).toBeNull();
  });
});
