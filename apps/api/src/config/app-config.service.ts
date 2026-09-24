import { Injectable, filterLogLevels } from '@nestjs/common';
import type { LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from './env.schema';

/**
 * The only place that reads environment values. Values are already validated
 * and coerced by `validateEnv`, so getters are typed and never undefined.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get nodeEnv() {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction() {
    return this.nodeEnv === 'production';
  }

  get port() {
    return this.config.get('PORT', { infer: true });
  }

  get databaseUrl() {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get jwtSecret() {
    return this.config.get('JWT_SECRET', { infer: true });
  }

  get passwordPepper() {
    return this.config.get('PASSWORD_PEPPER', { infer: true });
  }

  get jwtExpiresInSeconds() {
    return this.config.get('JWT_EXPIRES_IN_SECONDS', { infer: true });
  }

  get refreshTokenTtlDays() {
    return this.config.get('REFRESH_TOKEN_TTL_DAYS', { infer: true });
  }

  get googleClientId() {
    return this.config.get('GOOGLE_CLIENT_ID', { infer: true });
  }

  get logLevels(): LogLevel[] {
    const spec =
      this.config.get('LOG_LEVEL', { infer: true }) ??
      (this.isProduction ? '>=log' : '>=debug');

    return filterLogLevels(spec);
  }

  get logJson() {
    return this.config.get('LOG_JSON', { infer: true }) ?? this.isProduction;
  }
}
