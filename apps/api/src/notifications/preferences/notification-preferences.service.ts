import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';

import { DatabaseService, notificationPreferences } from '../../database';
import {
  NOTIFICATION_CHANNELS,
  NotificationChannel,
} from '../channels/notification-channel';
import type { ChannelId } from '../channels/notification-channel';
import { NOTIFICATION_EVENTS, NOTIFICATION_EVENT_TYPES } from '../events';
import type { NotificationEventType } from '../events';
import type { PreferenceChangeDto } from './dto/update-preferences.dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    private readonly database: DatabaseService,
    @Inject(NOTIFICATION_CHANNELS)
    private readonly channels: NotificationChannel[],
  ) {}

  async list(userId: string) {
    const overrides = await this.overrides(userId);

    return {
      channels: this.channels.map(({ id, label }) => ({ id, label })),
      events: NOTIFICATION_EVENT_TYPES.map((type) => ({
        type,
        label: NOTIFICATION_EVENTS[type].label,
        description: NOTIFICATION_EVENTS[type].description,
        channels: Object.fromEntries(
          this.channels.map(({ id }) => [
            id,
            overrides.get(`${id}:${type}`) ??
              NOTIFICATION_EVENTS[type].defaultEnabled,
          ]),
        ),
      })),
    };
  }

  async enabledChannels(userId: string, event: NotificationEventType) {
    const overrides = await this.overrides(userId, event);
    return this.channels
      .map(({ id }) => id)
      .filter(
        (id) =>
          overrides.get(`${id}:${event}`) ??
          NOTIFICATION_EVENTS[event].defaultEnabled,
      );
  }

  async update(userId: string, changes: PreferenceChangeDto[]) {
    const uniqueChanges = [
      ...new Map(
        changes.map((change) => [`${change.channel}:${change.event}`, change]),
      ).values(),
    ];

    if (uniqueChanges.length > 0) {
      await this.database.db
        .insert(notificationPreferences)
        .values(uniqueChanges.map((change) => ({ ...change, userId })))
        .onConflictDoUpdate({
          target: [
            notificationPreferences.userId,
            notificationPreferences.channel,
            notificationPreferences.event,
          ],
          set: { enabled: sql`excluded.enabled`, updatedAt: new Date() },
        });
    }
    return this.list(userId);
  }

  private async overrides(userId: string, event?: NotificationEventType) {
    const rows = await this.database.db
      .select()
      .from(notificationPreferences)
      .where(
        and(
          eq(notificationPreferences.userId, userId),
          event ? eq(notificationPreferences.event, event) : undefined,
        ),
      );
    return new Map(
      rows.map((row) => [
        `${row.channel as ChannelId}:${row.event}`,
        row.enabled,
      ]),
    );
  }
}
