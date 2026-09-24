import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

import { Trimmed } from '../../common/validation/decorators';

export class CreateServiceDto {
  @Trimmed()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @Trimmed()
  @IsString()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    require_tld: false,
  })
  @MaxLength(2048)
  endpoint!: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
