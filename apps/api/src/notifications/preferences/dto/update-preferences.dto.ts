import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  ValidateNested,
} from 'class-validator';

import { NOTIFICATION_EVENT_TYPES } from '../../events';
import type { NotificationEventType } from '../../events';
import { NOTIFICATION_CHANNEL_IDS } from '../../channels/notification-channel';
import type { ChannelId } from '../../channels/notification-channel';

export class PreferenceChangeDto {
  @IsIn(NOTIFICATION_EVENT_TYPES)
  event!: NotificationEventType;

  @IsIn(NOTIFICATION_CHANNEL_IDS)
  channel!: ChannelId;

  @IsBoolean()
  enabled!: boolean;
}

export class UpdatePreferencesDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => PreferenceChangeDto)
  preferences!: PreferenceChangeDto[];
}
