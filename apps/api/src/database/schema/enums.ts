import { pgEnum } from 'drizzle-orm/pg-core';

export const serviceStatus = pgEnum('service_status', [
  'warm',
  'warming',
  'cold',
  'sleeping',
  'down',
  'paused',
]);

export const warmPolicyMode = pgEnum('warm_policy_mode', [
  'interval',
  'schedule',
  'manual',
]);
