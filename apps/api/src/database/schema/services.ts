import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { serviceStatus } from './enums';
import { projects } from './projects';
import { users } from './users';

export const services = pgTable(
  'services',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    endpoint: text('endpoint').notNull(),
    status: serviceStatus('status').notNull().default('cold'),
    isEnabled: boolean('is_enabled').notNull().default(true),
    lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),
    // Set when a down notification goes out; cleared when the service recovers.
    downNotifiedAt: timestamp('down_notified_at', { withTimezone: true }),
    coldStartsNotifiedAt: timestamp('cold_starts_notified_at', {
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('services_user_endpoint_unique').on(
      table.userId,
      table.endpoint,
    ),
    index('services_user_id_idx').on(table.userId),
    index('services_project_id_idx').on(table.projectId),
  ],
);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
