import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { AppConfigService } from '../../config';
import { DatabaseService } from '../../database';

const RUN_EVERY_MS = 60 * 60_000;
const FIRST_RUN_DELAY_MS = 60_000;
const BATCH_SIZE = 5_000;

@Injectable()
export class CheckRetention implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(CheckRetention.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly config: AppConfigService,
    private readonly database: DatabaseService,
  ) {}

  onApplicationBootstrap() {
    if (!this.config.workerEnabled) return;
    const run = () =>
      void this.prune().catch((error: unknown) =>
        this.logger.error('Pruning old checks failed', error),
      );
    this.timer = setTimeout(() => {
      run();
      this.timer = setInterval(run, RUN_EVERY_MS);
    }, FIRST_RUN_DELAY_MS);
  }

  onModuleDestroy() {
    clearTimeout(this.timer);
  }

  // Small batches keep each delete short so it never blocks check writes.
  async prune() {
    const days = this.config.checkRetentionDays;
    const coldStarts = await this.deleteBatches(async () => {
      const { rowCount } = await this.database.db.execute(sql`
        delete from cold_start_events
        where id in (
          select id from cold_start_events
          where detected_at < now() - make_interval(days => ${days})
          limit ${BATCH_SIZE}
        )
      `);
      return rowCount ?? 0;
    });
    const checks = await this.deleteBatches(async () => {
      const { rowCount } = await this.database.db.execute(sql`
        delete from readiness_checks
        where id in (
          select id from readiness_checks
          where checked_at < now() - make_interval(days => ${days})
          limit ${BATCH_SIZE}
        )
      `);
      return rowCount ?? 0;
    });
    if (coldStarts + checks > 0) {
      this.logger.log(
        `Pruned ${checks} checks and ${coldStarts} cold-start events older than ${days} days`,
      );
    }
  }

  private async deleteBatches(remove: () => Promise<number>) {
    let total = 0;
    for (;;) {
      const deleted = await remove();
      total += deleted;
      if (deleted < BATCH_SIZE) return total;
    }
  }
}
