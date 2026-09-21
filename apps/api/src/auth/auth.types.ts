import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};
