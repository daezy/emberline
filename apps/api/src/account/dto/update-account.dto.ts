import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsTimeZone,
  MaxLength,
} from 'class-validator';

import { Trimmed } from '../../common/validation/decorators';

export class UpdateAccountDto {
  @IsOptional()
  @Trimmed()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
