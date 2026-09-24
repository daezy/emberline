import {
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PgBoss } from 'pg-boss';

import { AppConfigService } from '../config';
import { DatabaseService } from '../database';
import { queueDefinitions } from './queues';

const SHUTDOWN_TIMEOUT_MS = 15_000;

@Injectable()
export class PgBossService implements OnModuleInit, BeforeApplicationShutdown {
  private readonly logger = new Logger('PgBoss');
  private started?: Promise<PgBoss>;

  constructor(
    private readonly config: AppConfigService,
    private readonly database: DatabaseService,
  ) {}

  async onModuleInit() {
    await this.boss();
  }

  // Callers await this rather than relying on hook order between modules.
  boss() {
    return (this.started ??= this.start());
  }

  // After every onModuleDestroy (the scheduler has stopped) and before the
  // database pool closes in onApplicationShutdown.
  async beforeApplicationShutdown() {
    if (!this.started) return;
    const boss = await this.started;
    await boss.stop({ graceful: true, timeout: SHUTDOWN_TIMEOUT_MS });
  }

  private async start() {
    // Shares the app's pool instead of opening a second one. Maintenance only
    // runs on worker instances.
    const boss = new PgBoss({
      db: {
        executeSql: (text, values) => this.database.executeSql(text, values),
      },
      schedule: false,
      supervise: this.config.workerEnabled,
    });
    boss.on('error', (error) => this.logger.error('pg-boss error', error));
    await boss.start();

    const definitions = queueDefinitions(this.config.checkTimeoutMs);
    for (const [name, { policy, ...options }] of Object.entries(definitions)) {
      if (await boss.getQueue(name)) {
        await boss.updateQueue(name, options);
      } else {
        await boss.createQueue(name, { ...options, policy });
      }
    }
    return boss;
  }
}
