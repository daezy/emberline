import { Body, Controller, Get, Put } from '@nestjs/common';

import type { JwtPayload } from '../../auth/auth.types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { NotificationPreferencesService } from './notification-preferences.service';

@Controller('notifications/preferences')
export class NotificationPreferencesController {
  constructor(private readonly preferences: NotificationPreferencesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.preferences.list(user.sub);
  }

  @Put()
  update(
    @CurrentUser() user: JwtPayload,
    @Body() { preferences }: UpdatePreferencesDto,
  ) {
    return this.preferences.update(user.sub, preferences);
  }
}
