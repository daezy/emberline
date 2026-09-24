import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';

import type { JwtPayload } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { MonitoredServicesService } from './monitored-services.service';

@Controller()
export class MonitoredServicesController {
  constructor(private readonly services: MonitoredServicesService) {}

  @Get('services')
  listAll(@CurrentUser() user: JwtPayload) {
    return this.services.list(user.sub);
  }

  @Get('projects/:projectId/services')
  listForProject(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.services.list(user.sub, projectId);
  }

  @Post('projects/:projectId/services')
  create(
    @CurrentUser() user: JwtPayload,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateServiceDto,
  ) {
    return this.services.create(user.sub, projectId, dto);
  }

  @Get('services/:id')
  get(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.services.get(user.sub, id);
  }

  @Patch('services/:id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.services.update(user.sub, id, dto);
  }

  @Delete('services/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.services.remove(user.sub, id);
  }
}
