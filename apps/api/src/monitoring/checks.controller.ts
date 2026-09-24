import {
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import type { JwtPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DatabaseService, readinessChecks, services } from '../database';
import { MonitoredServicesService } from '../monitored-services/monitored-services.service';
import { CheckRunner } from './checks/check-runner';
import { ListChecksQueryDto } from './dto/list-checks-query.dto';

const MANUAL_WARM_COOLDOWN_MS = 30_000;

@Controller()
export class ChecksController {
  constructor(
    private readonly database: DatabaseService,
    private readonly services: MonitoredServicesService,
    private readonly runner: CheckRunner,
  ) {}

  @Post('services/:id/warm')
  @HttpCode(HttpStatus.OK)
  async warm(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const service = await this.services.get(user.sub, id);
    if (!service.isEnabled) {
      throw new ConflictException('Enable this service before checking it');
    }
    const sinceLastCheck = Date.now() - (service.lastCheckedAt?.getTime() ?? 0);
    if (sinceLastCheck < MANUAL_WARM_COOLDOWN_MS) {
      throw new HttpException(
        'This service was just checked. Try again in a few seconds.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const check = await this.runner.run({
      serviceId: service.id,
    });
    if (!check) {
      throw new ConflictException(
        'The service changed while the check was running; try again',
      );
    }
    return check;
  }

  @Get('services/:id/checks')
  async checks(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() { limit }: ListChecksQueryDto,
  ) {
    await this.services.get(user.sub, id);

    return this.database.db
      .select()
      .from(readinessChecks)
      .where(eq(readinessChecks.serviceId, id))
      .orderBy(desc(readinessChecks.checkedAt))
      .limit(limit);
  }

  @Get('activity')
  activity(
    @CurrentUser() user: JwtPayload,
    @Query() { limit }: ListChecksQueryDto,
  ) {
    return this.database.db
      .select({
        id: readinessChecks.id,
        serviceId: readinessChecks.serviceId,
        serviceName: services.name,
        status: readinessChecks.status,
        responseStatus: readinessChecks.responseStatus,
        latencyMs: readinessChecks.latencyMs,
        coldStartSuspected: readinessChecks.coldStartSuspected,
        errorMessage: readinessChecks.errorMessage,
        checkedAt: readinessChecks.checkedAt,
      })
      .from(readinessChecks)
      .innerJoin(services, eq(services.id, readinessChecks.serviceId))
      .where(eq(services.userId, user.sub))
      .orderBy(desc(readinessChecks.checkedAt))
      .limit(limit);
  }
}
