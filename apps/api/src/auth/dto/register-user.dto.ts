import { IsString, MaxLength, MinLength } from 'class-validator';

import {
  NormalizedEmail,
  PasswordField,
  Trimmed,
} from '../../common/validation/decorators';

export class RegisterUserDto {
  @Trimmed()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @NormalizedEmail()
  email!: string;

  @PasswordField(8)
  password!: string;
}
