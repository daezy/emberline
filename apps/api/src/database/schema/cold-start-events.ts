import {
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { readinessChecks } from './readiness-checks';
import { services } from './services';

export const coldStartEvents = pgTable(
  'cold_start_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    readinessCheckId: uuid('readiness_check_id').references(
      () => readinessChecks.id,
      { onDelete: 'set null' },
    ),
    baselineLatencyMs: integer('baseline_latency_ms').notNull(),
    observedLatencyMs: integer('observed_latency_ms').notNull(),
    detectedAt: timestamp('detected_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('cold_start_events_service_detected_at_index').on(
      table.serviceId,
      table.detectedAt,
    ),
    uniqueIndex('cold_start_events_check_unique').on(table.readinessCheckId),
  ],
);
