import { NormalizedEmail, PasswordField } from './decorators';

export class LoginUserDto {
  @NormalizedEmail()
  email: string;

  @PasswordField()
  password: string;
}
