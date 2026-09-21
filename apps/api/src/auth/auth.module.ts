import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AppConfigService } from '../config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleTokenService } from './services/google-token.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordService } from './services/password.service';
import { RefreshTokenService } from './services/refresh-token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: {
          algorithm: 'HS256',
          expiresIn: config.jwtExpiresInSeconds,
        },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    GoogleTokenService,
    RefreshTokenService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [PasswordService],
})
export class AuthModule {}
