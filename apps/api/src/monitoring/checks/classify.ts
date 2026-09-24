import type { ProbeResult } from '../probe/endpoint-probe';

type CheckStatus = 'warm' | 'warming' | 'down';

// Platforms like Render and Railway answer 502-504 while a sleeping instance
// boots, so those mean "waking up" rather than "broken".
const WAKING_STATUSES = new Set([502, 503, 504]);

export function classify({ responseStatus }: ProbeResult): CheckStatus {
  if (responseStatus === null) return 'down';
  if (WAKING_STATUSES.has(responseStatus)) return 'warming';
  if (responseStatus >= 500) return 'down';
  return 'warm';
}
