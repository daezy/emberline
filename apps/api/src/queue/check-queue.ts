import { Injectable } from '@nestjs/common';

import { PgBossService } from './pg-boss.service';
import { CHECK_QUEUE } from './queues';

export type CheckJob = {
  serviceId: string;
  endpoint: string;
};

export type SqlConnection = {
  executeSql(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
};

@Injectable()
export class CheckQueue {
  constructor(private readonly pgBoss: PgBossService) {}

  // With a connection, the jobs commit or roll back with the caller's
  // transaction.
  async enqueue(jobs: CheckJob[], connection?: SqlConnection) {
    if (jobs.length === 0) return;
    const boss = await this.pgBoss.boss();
    await boss.insert(
      CHECK_QUEUE,
      jobs.map((data) => ({ data, singletonKey: data.serviceId })),
      { db: connection },
    );
  }
}
