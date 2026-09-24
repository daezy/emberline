const MIN_SAMPLES = 5;
const SLOWDOWN_FACTOR = 3;
const MIN_EXTRA_MS = 1_000;

export function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

// A cold start is a response far slower than this service's recent warm
// responses. Both thresholds must hold so fast services don't trip on noise.
export function detectColdStart(
  latencyMs: number,
  recentWarmLatencies: number[],
) {
  if (recentWarmLatencies.length < MIN_SAMPLES) return null;

  const baselineMs = median(recentWarmLatencies);
  const isColdStart =
    latencyMs >= baselineMs * SLOWDOWN_FACTOR &&
    latencyMs >= baselineMs + MIN_EXTRA_MS;
  return isColdStart ? { baselineMs } : null;
}
