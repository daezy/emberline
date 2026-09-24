import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateServiceDto {
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  name: string;

  @Transform(trim)
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  endpoint: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
