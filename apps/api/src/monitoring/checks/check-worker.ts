import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import type { JobResult } from 'pg-boss';

import { AppConfigService } from '../../config';
import { CHECK_QUEUE, PgBossService } from '../../queue';
import type { CheckJob } from '../../queue';
import { CheckRunner } from './check-runner';

const WORKERS = 2;

@Injectable()
export class CheckWorker implements OnApplicationBootstrap {
  private readonly logger = new Logger(CheckWorker.name);

  constructor(
    private readonly config: AppConfigService,
    private readonly pgBoss: PgBossService,
    private readonly runner: CheckRunner,
  ) {}

  // Each worker fetches a batch and runs it concurrently, so idle polling is
  // WORKERS queries per interval rather than one per concurrency slot.
  async onApplicationBootstrap() {
    if (!this.config.workerEnabled) return;

    const boss = await this.pgBoss.boss();
    await boss.work<CheckJob>(
      CHECK_QUEUE,
      {
        localConcurrency: WORKERS,
        batchSize: Math.ceil(this.config.checkConcurrency / WORKERS),
        perJobResults: true,
        burstWhenBatchFull: true,
        pollingIntervalSeconds: 2,
      },
      (jobs) =>
        Promise.all(
          jobs.map(async ({ id, data }): Promise<JobResult> => {
            try {
              await this.runner.run(data);
              return { id, status: 'completed' };
            } catch (error) {
              this.logger.error(
                `Check failed for service ${data.serviceId}`,
                error,
              );
              return {
                id,
                status: 'failed',
                output: { message: String(error) },
              };
            }
          }),
        ),
    );
    this.logger.log('Check workers started');
  }
}
