import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';

import type { JwtPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MonitoredServicesService } from '../monitored-services/monitored-services.service';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { WarmPoliciesService } from './scheduling/warm-policies.service';

@Controller('services/:id/policy')
export class WarmPoliciesController {
  constructor(
    private readonly services: MonitoredServicesService,
    private readonly policies: WarmPoliciesService,
  ) {}

  @Get()
  async get(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.services.get(user.sub, id);
    return this.policies.get(id);
  }

  @Patch()
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePolicyDto,
  ) {
    await this.services.get(user.sub, id);
    return this.policies.update(id, dto);
  }
}
