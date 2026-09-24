import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { serviceStatus } from './enums';
import { services } from './services';

export const readinessChecks = pgTable(
  'readiness_checks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    status: serviceStatus('status').notNull(),
    responseStatus: integer('response_status'),
    latencyMs: integer('latency_ms'),
    coldStartSuspected: boolean('cold_start_suspected')
      .notNull()
      .default(false),
    errorMessage: text('error_message'),
    checkedAt: timestamp('checked_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('readiness_checks_service_checked_at_index').on(
      table.serviceId,
      table.checkedAt,
    ),
    index('readiness_checks_checked_at_index').on(table.checkedAt),
  ],
);
