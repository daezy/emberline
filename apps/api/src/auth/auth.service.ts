import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, sql } from 'drizzle-orm';

import { DatabaseService, User, users } from '../database';
import type { AuthResponse, AuthUser, JwtPayload } from './auth.types';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { GoogleTokenService } from './services/google-token.service';
import { PasswordService } from './services/password.service';

@Injectable()
export class AuthService {
  private readonly dummyHash: Promise<string>;

  constructor(
    private readonly database: DatabaseService,
    private readonly passwords: PasswordService,
    private readonly google: GoogleTokenService,
    private readonly jwt: JwtService,
  ) {
    this.dummyHash = this.passwords.hash('timing-equalizer');
  }

  async register(dto: RegisterUserDto): Promise<AuthResponse> {
    const passwordHash = await this.passwords.hash(dto.password);

    const [user] = await this.database.db
      .insert(users)
      .values({ email: dto.email, name: dto.name, passwordHash })
      .onConflictDoNothing()
      .returning();

    if (!user) {
      throw new ConflictException('An account with this email already exists');
    }

    return this.issue(user);
  }

  async login(dto: LoginUserDto): Promise<AuthResponse> {
    const user = await this.findByEmail(dto.email);

    const valid = await this.passwords.verify(
      user?.passwordHash ?? (await this.dummyHash),
      dto.password,
    );
    if (!user?.passwordHash || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (this.passwords.needsRehash(user.passwordHash)) {
      await this.database.db
        .update(users)
        .set({ passwordHash: await this.passwords.hash(dto.password) })
        .where(eq(users.id, user.id));
    }

    return this.issue(user);
  }

  async loginWithGoogle(dto: GoogleLoginDto): Promise<AuthResponse> {
    const profile = await this.google.verify(dto.idToken);
    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google email is not verified');
    }

    let user = await this.findByEmail(profile.email);

    if (!user) {
      [user] = await this.database.db
        .insert(users)
        .values({ email: profile.email, name: profile.name })
        .onConflictDoNothing()
        .returning();
      user ??= await this.findByEmail(profile.email);
    } else if (user.passwordHash) {
      [user] = await this.database.db
        .update(users)
        .set({ passwordHash: null })
        .where(eq(users.id, user.id))
        .returning();
    }

    if (!user) {
      throw new InternalServerErrorException();
    }

    return this.issue(user);
  }

  async getProfile(id: string): Promise<AuthUser> {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.toAuthUser(user);
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, email: user.email, name: user.name };
  }

  private async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
      .limit(1);
    return user;
  }

  private async issue(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: this.toAuthUser(user),
    };
  }
}
