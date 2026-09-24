import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import type { PoolClient } from 'pg';

import { AppConfigService } from '../../config';
import { DatabaseService } from '../../database';
import type { WarmSchedule } from '../../database';
import { CheckQueue } from '../../queue';
import type { CheckJob } from '../../queue';
import { isWithinWindow, nextRunAt, nextWindowStart } from './warm-schedule';
import type { SchedulablePolicy } from './warm-schedule';

const CLAIM_BATCH = 100;
const MIN_DELAY_MS = 1_000;
const MAX_IDLE_MS = 30_000;
const ERROR_BACKOFF_MS = 10_000;

const ACTIVE = `
  wp.is_enabled
  and s.is_enabled
  and wp.mode in ('interval', 'schedule')
`;

// Advancing next_warm_at in the same statement is the claim; SKIP LOCKED keeps
// concurrent schedulers from picking the same rows.
const CLAIM_DUE = `
  update warm_policies p
  set next_warm_at = now() + make_interval(mins => coalesce(p.interval_minutes, 10)),
      updated_at = now()
  from services s
  where s.id = p.service_id
    and p.id in (
      select wp.id
      from warm_policies wp
      join services s on s.id = wp.service_id
      where ${ACTIVE}
        and (wp.next_warm_at is null or wp.next_warm_at <= now())
      order by wp.next_warm_at nulls first
      limit $1
      for update of wp skip locked
    )
  returning p.id as "policyId", s.id as "serviceId",
    p.mode, p.interval_minutes as "intervalMinutes", p.timezone, p.schedule
`;

const MS_UNTIL_NEXT_DUE = `
  select greatest(0, extract(epoch from min(wp.next_warm_at) - now()) * 1000)::int as "delayMs"
  from warm_policies wp
  join services s on s.id = wp.service_id
  where ${ACTIVE}
`;

type ClaimedPolicy = CheckJob &
  SchedulablePolicy & {
    policyId: string;
    schedule: WarmSchedule | null;
  };

@Injectable()
export class CheckScheduler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(CheckScheduler.name);
  private running = false;
  private loop?: Promise<void>;
  private wake?: () => void;

  constructor(
    private readonly config: AppConfigService,
    private readonly database: DatabaseService,
    private readonly queue: CheckQueue,
  ) {}

  onApplicationBootstrap() {
    if (!this.config.workerEnabled) return;
    this.running = true;
    this.loop = this.run();
    this.logger.log('Check scheduler started');
  }

  async onModuleDestroy() {
    if (!this.running) return;
    this.running = false;
    this.wake?.();
    await this.loop;
    this.logger.log('Check scheduler stopped');
  }

  private async run() {
    while (this.running) {
      let delay: number;
      try {
        delay = await this.tick();
      } catch (error) {
        this.logger.error('Scheduler tick failed', error);
        delay = ERROR_BACKOFF_MS;
      }
      if (delay > 0) await this.sleep(delay);
    }
  }

  // Claiming and enqueueing share one transaction, so a crash in between
  // can't advance a policy without queueing its check.
  private async tick(): Promise<number> {
    const claimed = await this.database.sqlTransaction(async (client) => {
      const { rows } = await client.query<ClaimedPolicy>(CLAIM_DUE, [
        CLAIM_BATCH,
      ]);
      const jobs = await this.applySchedules(client, rows);
      await this.queue.enqueue(jobs, {
        executeSql: (text, values) => client.query(text, values),
      });
      return rows.length;
    });
    if (claimed === CLAIM_BATCH) return 0;

    const { rows } = await this.database.executeSql(MS_UNTIL_NEXT_DUE);
    const delayMs = (rows[0] as { delayMs: number | null } | undefined)
      ?.delayMs;
    return Math.min(
      Math.max(delayMs ?? MAX_IDLE_MS, MIN_DELAY_MS),
      MAX_IDLE_MS,
    );
  }

  // The claim advanced every policy by its interval. Scheduled policies still
  // need that corrected to respect their window, and are skipped outside it.
  private async applySchedules(
    client: PoolClient,
    claimed: ClaimedPolicy[],
  ): Promise<CheckJob[]> {
    const now = new Date();
    const jobs: CheckJob[] = [];

    for (const policy of claimed) {
      const job = { serviceId: policy.serviceId };
      if (policy.mode !== 'schedule' || !policy.schedule) {
        jobs.push(job);
        continue;
      }

      const inWindow = isWithinWindow(policy.schedule, policy.timezone, now);
      // A null here would make the policy due immediately and spin the loop.
      const nextWarmAt =
        (inWindow
          ? nextRunAt(policy, now)
          : nextWindowStart(policy.schedule, policy.timezone, now)) ??
        nextRunAt({ ...policy, mode: 'interval' }, now);

      await client.query(
        'update warm_policies set next_warm_at = $2 where id = $1',
        [policy.policyId, nextWarmAt],
      );

      if (inWindow) {
        jobs.push(job);
      } else {
        await client.query(
          `update services set status = 'sleeping' where id = $1 and is_enabled`,
          [policy.serviceId],
        );
      }
    }
    return jobs;
  }

  private sleep(ms: number) {
    return new Promise<void>((resolve) => {
      const timer = setTimeout(done, ms);
      this.wake = done;
      function done() {
        clearTimeout(timer);
        resolve();
      }
    });
  }
}
