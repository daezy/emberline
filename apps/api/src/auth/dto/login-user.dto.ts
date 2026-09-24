import {
  NormalizedEmail,
  PasswordField,
} from '../../common/validation/decorators';

export class LoginUserDto {
  @NormalizedEmail()
  email!: string;

  @PasswordField()
  password!: string;
}
