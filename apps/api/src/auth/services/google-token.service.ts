import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

import { AppConfigService } from '../../config';

export interface GoogleProfile {
  email: string;
  emailVerified: boolean;
  name: string | null;
}

@Injectable()
export class GoogleTokenService {
  private readonly client = new OAuth2Client();

  constructor(private readonly config: AppConfigService) {}

  async verify(idToken: string): Promise<GoogleProfile> {
    const audience = this.config.googleClientId;
    if (!audience) {
      throw new ServiceUnavailableException('Google sign-in is not configured');
    }

    try {
      const ticket = await this.client.verifyIdToken({ idToken, audience });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        throw new Error('Token has no email claim');
      }

      return {
        email: payload.email.toLowerCase(),
        emailVerified: payload.email_verified === true,
        name: payload.name ?? null,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
