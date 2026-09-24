import type { LogLevel } from '@nestjs/common';
import { z } from 'zod';

const postgresUrl = z
  .string()
  .min(1)
  .refine((value) => /^postgres(ql)?:\/\//.test(value), {
    message: 'must be a postgres:// or postgresql:// connection string',
  });

const logLevelNames = [
  'verbose',
  'debug',
  'log',
  'warn',
  'error',
  'fatal',
] as const satisfies readonly LogLevel[];

function isLogLevelSpec(value: string): boolean {
  const sanitized = value.replaceAll(' ', '').toLowerCase();

  if (sanitized.startsWith('>')) {
    const name = sanitized.replace(/^>=?/, '');
    return (logLevelNames as readonly string[]).includes(name);
  }

  const names = sanitized.split(',');
  return (
    names.length > 0 &&
    names.every((name) => (logLevelNames as readonly string[]).includes(name))
  );
}

const booleanish = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1');

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: postgresUrl,
  DATABASE_URL_UNPOOLED: postgresUrl.optional(),
  JWT_SECRET: z.string().min(32),
  PASSWORD_PEPPER: z.string().min(32),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  WORKER_ENABLED: booleanish.default(true),
  CHECK_CONCURRENCY: z.coerce.number().int().min(1).max(500).default(20),
  CHECK_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(120000)
    .default(30000),
  CHECK_ALLOW_PRIVATE_NETWORKS: booleanish.default(false),
  CHECK_RETENTION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  LOG_LEVEL: z
    .string()
    .optional()
    .refine((value) => value === undefined || isLogLevelSpec(value), {
      message: `must be a level (${logLevelNames.join(' | ')}), a list ('log,error'), or a threshold ('>=warn')`,
    }),
  LOG_JSON: booleanish.optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid environment configuration:\n${problems}`);
  }

  return result.data;
}
