import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsTimeZone,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ScheduleDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  days!: number[];

  @Matches(TIME, { message: 'startTime must be HH:MM' })
  startTime!: string;

  @Matches(TIME, { message: 'endTime must be HH:MM' })
  endTime!: string;
}

export class UpdatePolicyDto {
  @IsOptional()
  @IsIn(['interval', 'schedule', 'manual'])
  mode?: 'interval' | 'schedule' | 'manual';

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(1440)
  intervalMinutes?: number;

  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule?: ScheduleDto;
}
