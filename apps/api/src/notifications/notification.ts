import type { NotificationEventType, ServiceEvent } from './events';

// Channel-neutral content. Each channel decides how to present it.
export type Notification = {
  event: NotificationEventType;
  severity: 'critical' | 'resolved' | 'warning';
  title: string;
  message: string;
  details: Array<{ label: string; value: string }>;
  url: string;
};

export type Recipient = {
  email: string;
};

export type NotificationContext = {
  service: { id: string; name: string; endpoint: string };
  check: {
    responseStatus: number | null;
    latencyMs: number | null;
    errorMessage: string | null;
    checkedAt: Date;
  } | null;
  timezone: string;
  webAppUrl: string;
};

function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short',
  }).format(date);
}

function formatDuration(ms: number) {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function buildNotification(
  event: ServiceEvent,
  { service, check, timezone, webAppUrl }: NotificationContext,
): Notification {
  const url = `${webAppUrl}/dashboard/services/${service.id}`;
  const base = [{ label: 'Endpoint', value: service.endpoint }];
  const occurredAt = check?.checkedAt ?? new Date(event.occurredAt);
  const checkedAt = [
    { label: 'Checked at', value: formatTime(occurredAt, timezone) },
  ];

  switch (event.type) {
    case 'service.down':
      return {
        event: event.type,
        severity: 'critical',
        title: `${service.name} is down`,
        message: `${service.name} failed ${event.failureCount} checks in a row. Emberline will keep checking and tell you when it responds again.`,
        details: [
          ...base,
          {
            label: 'Error',
            value:
              check?.errorMessage ??
              (check?.responseStatus
                ? `HTTP ${check.responseStatus}`
                : 'No response'),
          },
          ...checkedAt,
        ],
        url,
      };
    case 'service.recovered': {
      const reportedDownAt = new Date(event.reportedDownAt);
      const recoveredAt = occurredAt;
      return {
        event: event.type,
        severity: 'resolved',
        title: `${service.name} is back up`,
        message: `${service.name} is responding again after being reported down for about ${formatDuration(recoveredAt.getTime() - reportedDownAt.getTime())}.`,
        details: [
          ...base,
          ...(check?.latencyMs != null
            ? [{ label: 'Latency', value: `${check.latencyMs} ms` }]
            : []),
          {
            label: 'Reported down',
            value: formatTime(reportedDownAt, timezone),
          },
          ...checkedAt,
        ],
        url,
      };
    }
    case 'service.cold_starts':
      return {
        event: event.type,
        severity: 'warning',
        title: `${service.name} keeps cold starting`,
        message: `${service.name} had ${event.count} cold starts in the last ${formatDuration(event.windowMinutes * 60_000)}. Its host may be putting it to sleep between checks; a shorter interval can help.`,
        details: [...base, ...checkedAt],
        url,
      };
  }
}
