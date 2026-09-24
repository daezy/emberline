export const NOTIFICATION_EVENTS = {
  'service.down': {
    label: 'Service went down',
    description: 'After repeated failed checks.',
    defaultEnabled: true,
  },
  'service.recovered': {
    label: 'Service recovered',
    description: 'When a service that was down responds again.',
    defaultEnabled: true,
  },
  'service.cold_starts': {
    label: 'Repeated cold starts',
    description: 'When several cold starts happen in a short period.',
    defaultEnabled: false,
  },
} as const;

export type NotificationEventType = keyof typeof NOTIFICATION_EVENTS;

export const NOTIFICATION_EVENT_TYPES = Object.keys(
  NOTIFICATION_EVENTS,
) as NotificationEventType[];

type EventMetadata = {
  serviceId: string;
  occurredAt: string;
};

export type ServiceEvent =
  | (EventMetadata & {
      type: 'service.down';
      checkId: string;
      failureCount: number;
    })
  | {
      type: 'service.recovered';
      serviceId: string;
      checkId: string;
      reportedDownAt: string;
      occurredAt: string;
    }
  | (EventMetadata & {
      type: 'service.cold_starts';
      count: number;
      windowMinutes: number;
    });
