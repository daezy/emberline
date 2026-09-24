import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { Trimmed } from '../../common/validation/decorators';

export class CreateProjectDto {
  @Trimmed()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}
