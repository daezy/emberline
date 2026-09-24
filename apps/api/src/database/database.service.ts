import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import type { PoolClient } from 'pg';

import { AppConfigService } from '../config';
import type { AppDatabase } from './database.types';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;
  readonly db: AppDatabase;

  constructor(config: AppConfigService) {
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
    this.db = drizzle({ client: this.pool, schema });
  }

  async onModuleInit() {
    await this.ping();
    this.logger.log('Database connected');
  }

  // Runs after every onModuleDestroy hook, so in-flight work can still write.
  async onApplicationShutdown() {
    await this.pool.end();
    this.logger.log('Database pool closed');
  }

  // Raw SQL for callers that share a transaction with non-Drizzle code, such
  // as pg-boss inserts.
  executeSql(text: string, values?: unknown[]) {
    return this.pool.query(text, values);
  }

  async sqlTransaction<T>(
    fn: (client: PoolClient, db: AppDatabase) => Promise<T>,
  ) {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      const result = await fn(client, drizzle({ client, schema }));
      await client.query('commit');
      return result;
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }

  async ping() {
    await this.db.execute(sql`select 1`);
  }
}
