import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { DatabaseService } from '../database';

@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  // Liveness: the process is up. Must not touch the database.
  @Get()
  live() {
    return { status: 'ok' };
  }

  // Readiness: the app can actually serve requests.
  @Get('ready')
  async ready() {
    try {
      await this.database.ping();
    } catch {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        database: 'down',
      });
    }
    return { status: 'ok', database: 'up' };
  }
}
