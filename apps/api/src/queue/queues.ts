import type { Queue } from 'pg-boss';

export const CHECK_QUEUE = 'service-checks';

type QueueDefinition = Omit<Queue, 'name'>;

export function queueDefinitions(
  checkTimeoutMs: number,
): Record<string, QueueDefinition> {
  return {
    [CHECK_QUEUE]: {
      // At most one queued check per singletonKey (the service).
      policy: 'short',
      retryLimit: 2,
      retryDelay: 5,
      retryBackoff: true,
      expireInSeconds: Math.ceil(checkTimeoutMs / 1000) + 30,
      // A check still queued after 5 minutes is stale; the next one replaces it.
      retentionSeconds: 5 * 60,
      deleteAfterSeconds: 24 * 60 * 60,
    },
  };
}
