import {
  evaluateIncidents,
  isFailedCheck,
  serviceStatusAfterCheck,
} from './incidents';
import type { IncidentState } from './incidents';

const now = new Date('2026-09-24T12:00:00Z');
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60_000);

const state = (overrides: Partial<IncidentState>): IncidentState => ({
  isFailure: false,
  consecutiveFailures: 0,
  downNotifiedAt: null,
  coldStartsNotifiedAt: null,
  recentColdStarts: null,
  now,
  ...overrides,
});

describe('evaluateIncidents', () => {
  it('waits for a second failure before reporting down', () => {
    expect(
      evaluateIncidents(state({ isFailure: true, consecutiveFailures: 1 }))
        .wentDown,
    ).toBe(false);

    const outcome = evaluateIncidents(
      state({ isFailure: true, consecutiveFailures: 2 }),
    );
    expect(outcome.wentDown).toBe(true);
    expect(outcome.updates.downNotifiedAt).toEqual(now);
  });

  it('reports each outage once', () => {
    const outcome = evaluateIncidents(
      state({
        isFailure: true,
        consecutiveFailures: 5,
        downNotifiedAt: minutesAgo(30),
      }),
    );
    expect(outcome.wentDown).toBe(false);
    expect(outcome.updates).toEqual({});
  });

  it('reports recovery only after a reported outage', () => {
    expect(evaluateIncidents(state({})).recoveredFrom).toBeNull();

    const outcome = evaluateIncidents(
      state({ downNotifiedAt: minutesAgo(30) }),
    );
    expect(outcome.recoveredFrom).toEqual(minutesAgo(30));
    expect(outcome.updates.downNotifiedAt).toBeNull();
  });

  it('reports repeated cold starts at most once an hour', () => {
    expect(
      evaluateIncidents(state({ recentColdStarts: 2 })).coldStarts,
    ).toBeNull();
    expect(evaluateIncidents(state({ recentColdStarts: 3 })).coldStarts).toBe(
      3,
    );
    expect(
      evaluateIncidents(
        state({ recentColdStarts: 4, coldStartsNotifiedAt: minutesAgo(20) }),
      ).coldStarts,
    ).toBeNull();
    expect(
      evaluateIncidents(
        state({ recentColdStarts: 3, coldStartsNotifiedAt: minutesAgo(61) }),
      ).coldStarts,
    ).toBe(3);
  });
});

describe('service status', () => {
  it.each(['down', 'warming'] as const)(
    'treats %s checks as failures',
    (status) => expect(isFailedCheck(status)).toBe(true),
  );

  it('only marks a service down after repeated failures', () => {
    expect(serviceStatusAfterCheck('down', 1)).toBe('warming');
    expect(serviceStatusAfterCheck('warming', 2)).toBe('down');
  });

  it('uses a successful check status immediately', () => {
    expect(serviceStatusAfterCheck('warm', 0)).toBe('warm');
    expect(serviceStatusAfterCheck('cold', 0)).toBe('cold');
  });
});
