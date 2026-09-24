import { createHash } from 'node:crypto';

import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { AppConfigService } from '../config';
import { DatabaseService, readinessChecks, services, users } from '../database';
import {
  NOTIFICATION_DELIVERIES_QUEUE,
  NOTIFICATION_EVENTS_QUEUE,
  PgBossService,
} from '../queue';
import {
  NOTIFICATION_CHANNELS,
  NotificationChannel,
} from './channels/notification-channel';
import type { ChannelId } from './channels/notification-channel';
import type { ServiceEvent } from './events';
import { buildNotification } from './notification';
import type { Notification, Recipient } from './notification';
import { NotificationPreferencesService } from './preferences/notification-preferences.service';

type Delivery = {
  channel: ChannelId;
  userId: string;
  notification: Notification;
};

// A retried fan-out produces the same ids, so pg-boss skips deliveries it
// already has instead of sending twice.
function deliveryId(eventJobId: string, channel: ChannelId) {
  const hex = createHash('sha256')
    .update(`${eventJobId}:${channel}`)
    .digest('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-');
}

@Injectable()
export class NotificationWorker implements OnApplicationBootstrap {
  private readonly logger = new Logger(NotificationWorker.name);
  private readonly channels: Map<ChannelId, NotificationChannel>;

  constructor(
    private readonly config: AppConfigService,
    private readonly database: DatabaseService,
    private readonly pgBoss: PgBossService,
    private readonly preferences: NotificationPreferencesService,
    @Inject(NOTIFICATION_CHANNELS) channels: NotificationChannel[],
  ) {
    this.channels = new Map(channels.map((channel) => [channel.id, channel]));
  }

  async onApplicationBootstrap() {
    if (!this.config.workerEnabled) return;

    const boss = await this.pgBoss.boss();
    await boss.work<ServiceEvent>(
      NOTIFICATION_EVENTS_QUEUE,
      { pollingIntervalSeconds: 5 },
      async ([job]) => this.fanOut(job.id, job.data),
    );
    await boss.work<Delivery>(
      NOTIFICATION_DELIVERIES_QUEUE,
      { pollingIntervalSeconds: 5 },
      async ([job]) => this.deliver(job.id, job.data),
    );
    this.logger.log('Notification workers started');
  }

  private async fanOut(jobId: string, event: ServiceEvent) {
    const [row] = await this.database.db
      .select({
        service: {
          id: services.id,
          name: services.name,
          endpoint: services.endpoint,
        },
        user: {
          id: users.id,
          timezone: users.timezone,
        },
      })
      .from(services)
      .innerJoin(users, eq(users.id, services.userId))
      .where(eq(services.id, event.serviceId))
      .limit(1);
    // The service was deleted before its event was processed.
    if (!row) return;

    const channels = await this.preferences.enabledChannels(
      row.user.id,
      event.type,
    );
    if (channels.length === 0) return;

    const [check] =
      'checkId' in event
        ? await this.database.db
            .select()
            .from(readinessChecks)
            .where(eq(readinessChecks.id, event.checkId))
            .limit(1)
        : [];

    const notification = buildNotification(event, {
      service: row.service,
      check: check ?? null,
      timezone: row.user.timezone,
      webAppUrl: this.config.webAppUrl,
    });
    const boss = await this.pgBoss.boss();
    await boss.insert(
      NOTIFICATION_DELIVERIES_QUEUE,
      channels.map((channel) => ({
        id: deliveryId(jobId, channel),
        data: {
          channel,
          userId: row.user.id,
          notification,
        } satisfies Delivery,
      })),
    );
  }

  private async deliver(jobId: string, delivery: Delivery) {
    const channel = this.channels.get(delivery.channel);
    if (!channel) {
      this.logger.warn(
        `Dropping delivery for unknown channel ${delivery.channel}`,
      );
      return;
    }
    const [user] = await this.database.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, delivery.userId))
      .limit(1);
    if (!user) return;

    const recipient: Recipient = { email: user.email };
    await channel.send(recipient, delivery.notification, jobId);
  }
}
