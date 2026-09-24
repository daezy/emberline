import type { Notification, Recipient } from '../notification';

export const NOTIFICATION_CHANNEL_IDS = ['email'] as const;
export type ChannelId = (typeof NOTIFICATION_CHANNEL_IDS)[number];

export abstract class NotificationChannel {
  abstract readonly id: ChannelId;
  abstract readonly label: string;

  // deliveryId is stable across retries of the same delivery.
  abstract send(
    recipient: Recipient,
    notification: Notification,
    deliveryId: string,
  ): Promise<void>;
}

export const NOTIFICATION_CHANNELS = Symbol('NOTIFICATION_CHANNELS');
