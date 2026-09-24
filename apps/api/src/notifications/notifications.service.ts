import { Injectable } from '@nestjs/common';

import { NOTIFICATION_EVENTS_QUEUE, PgBossService } from '../queue';
import type { SqlConnection } from '../queue';
import type { ServiceEvent } from './events';

@Injectable()
export class NotificationsService {
  constructor(private readonly pgBoss: PgBossService) {}

  // Callers only describe what happened; who hears about it, and how, is
  // decided when the event is processed.
  async publish(events: ServiceEvent[], connection?: SqlConnection) {
    if (events.length === 0) return;
    const boss = await this.pgBoss.boss();
    await boss.insert(
      NOTIFICATION_EVENTS_QUEUE,
      events.map((data) => ({ data })),
      { db: connection },
    );
  }
}
