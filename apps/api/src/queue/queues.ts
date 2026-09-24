import type { Queue } from 'pg-boss';

export const CHECK_QUEUE = 'service-checks';
export const NOTIFICATION_EVENTS_QUEUE = 'notification-events';
export const NOTIFICATION_DELIVERIES_QUEUE = 'notification-deliveries';

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
    // Fans an event out into one delivery per enabled channel.
    [NOTIFICATION_EVENTS_QUEUE]: {
      policy: 'standard',
      retryLimit: 3,
      retryDelay: 10,
      retryBackoff: true,
      expireInSeconds: 60,
      retentionSeconds: 24 * 60 * 60,
      deleteAfterSeconds: 3 * 24 * 60 * 60,
    },
    // One job per channel, so a failing channel retries without resending
    // the others.
    [NOTIFICATION_DELIVERIES_QUEUE]: {
      policy: 'standard',
      retryLimit: 5,
      retryDelay: 30,
      retryBackoff: true,
      retryDelayMax: 30 * 60,
      expireInSeconds: 2 * 60,
      retentionSeconds: 24 * 60 * 60,
      deleteAfterSeconds: 7 * 24 * 60 * 60,
    },
  };
}
