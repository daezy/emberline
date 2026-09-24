export const DOWN_AFTER_FAILURES = 2;
export const COLD_STARTS_THRESHOLD = 3;
export const COLD_STARTS_WINDOW_MINUTES = 60;
export const COLD_STARTS_WINDOW_MS = COLD_STARTS_WINDOW_MINUTES * 60_000;

export type CheckStatus = 'warm' | 'warming' | 'cold' | 'down';

export function isFailedCheck(status: CheckStatus) {
  return status === 'down' || status === 'warming';
}

export function serviceStatusAfterCheck(
  status: CheckStatus,
  consecutiveFailures: number,
): CheckStatus {
  if (!isFailedCheck(status)) return status;
  return consecutiveFailures >= DOWN_AFTER_FAILURES ? 'down' : 'warming';
}

export type IncidentState = {
  isFailure: boolean;
  // Including the check being evaluated.
  consecutiveFailures: number;
  downNotifiedAt: Date | null;
  coldStartsNotifiedAt: Date | null;
  // Cold starts within the window including this check, or null when this
  // check was not a cold start.
  recentColdStarts: number | null;
  now: Date;
};

export type IncidentOutcome = {
  wentDown: boolean;
  recoveredFrom: Date | null;
  coldStarts: number | null;
  updates: {
    downNotifiedAt?: Date | null;
    coldStartsNotifiedAt?: Date;
  };
};

// Decides which notifications a check triggers. Each incident notifies once:
// down is marked when announced and cleared on recovery, and cold starts are
// announced at most once per window.
export function evaluateIncidents(state: IncidentState): IncidentOutcome {
  const outcome: IncidentOutcome = {
    wentDown: false,
    recoveredFrom: null,
    coldStarts: null,
    updates: {},
  };

  if (
    state.isFailure &&
    state.consecutiveFailures >= DOWN_AFTER_FAILURES &&
    !state.downNotifiedAt
  ) {
    outcome.wentDown = true;
    outcome.updates.downNotifiedAt = state.now;
  } else if (!state.isFailure && state.downNotifiedAt) {
    outcome.recoveredFrom = state.downNotifiedAt;
    outcome.updates.downNotifiedAt = null;
  }

  const quietSince = state.now.getTime() - COLD_STARTS_WINDOW_MS;
  if (
    state.recentColdStarts !== null &&
    state.recentColdStarts >= COLD_STARTS_THRESHOLD &&
    (!state.coldStartsNotifiedAt ||
      state.coldStartsNotifiedAt.getTime() <= quietSince)
  ) {
    outcome.coldStarts = state.recentColdStarts;
    outcome.updates.coldStartsNotifiedAt = state.now;
  }

  return outcome;
}
