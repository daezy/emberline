import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { warmPolicyMode } from './enums';
import { services } from './services';

export type WarmSchedule = {
  days: number[];
  startTime: string;
  endTime: string;
};

export const warmPolicies = pgTable(
  'warm_policies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    mode: warmPolicyMode('mode').notNull().default('interval'),
    intervalMinutes: integer('interval_minutes'),
    timezone: text('timezone').notNull().default('UTC'),
    schedule: jsonb('schedule').$type<WarmSchedule>(),
    nextWarmAt: timestamp('next_warm_at', { withTimezone: true }),
    isEnabled: boolean('is_enabled').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('warm_policies_service_unique').on(table.serviceId),
    index('warm_policies_next_warm_at_index').on(table.nextWarmAt),
  ],
);
