import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, sql } from 'drizzle-orm';

import { DatabaseService, NewUser, User, users } from '../database';
import { ProjectsService } from '../projects';
import type { AuthResponse, AuthUser, JwtPayload } from './auth.types';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { GoogleTokenService } from './services/google-token.service';
import { PasswordService } from './services/password.service';
import { RefreshTokenService } from './services/refresh-token.service';

@Injectable()
export class AuthService {
  private readonly dummyHash: Promise<string>;

  constructor(
    private readonly database: DatabaseService,
    private readonly passwords: PasswordService,
    private readonly google: GoogleTokenService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly jwt: JwtService,
    private readonly projects: ProjectsService,
  ) {
    this.dummyHash = this.passwords.hash('timing-equalizer');
  }

  async register(dto: RegisterUserDto): Promise<AuthResponse> {
    const passwordHash = await this.passwords.hash(dto.password);

    const user = await this.createUser({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

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
      user =
        (await this.createUser({ email: profile.email, name: profile.name })) ??
        (await this.findByEmail(profile.email));
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

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const { userId, refreshToken } = await this.refreshTokens.rotate(
      dto.refreshToken,
    );

    return this.issue(await this.getUser(userId), refreshToken);
  }

  logout(dto: RefreshTokenDto) {
    return this.refreshTokens.revoke(dto.refreshToken);
  }

  async getProfile(id: string): Promise<AuthUser> {
    return this.toAuthUser(await this.getUser(id));
  }

  private async getUser(id: string): Promise<User> {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private toAuthUser(user: User): AuthUser {
    return { id: user.id, email: user.email, name: user.name };
  }

  // Undefined when the email is already taken.
  private createUser(values: NewUser): Promise<User | undefined> {
    return this.database.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values(values)
        .onConflictDoNothing()
        .returning();
      if (user) {
        await this.projects.createDefault(tx, user.id);
      }
      return user;
    });
  }

  private async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(sql`lower(${users.email})`, email.toLowerCase()))
      .limit(1);
    return user;
  }

  private async issue(
    user: User,
    refreshToken?: string,
  ): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      accessToken: await this.jwt.signAsync(payload),
      refreshToken: refreshToken ?? (await this.refreshTokens.issue(user.id)),
      user: this.toAuthUser(user),
    };
  }
}
