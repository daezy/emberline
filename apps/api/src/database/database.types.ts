import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type * as schema from './schema';

export type AppDatabase = NodePgDatabase<typeof schema>;

// The `tx` handed to `db.transaction(async (tx) => ...)`.
export type AppTransaction = Parameters<
  Parameters<AppDatabase['transaction']>[0]
>[0];
