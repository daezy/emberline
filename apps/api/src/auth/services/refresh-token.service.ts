import { Injectable, UnauthorizedException } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { createHash, randomBytes, randomUUID } from 'node:crypto';

import { AppConfigService } from '../../config';
import {
  AppDatabase,
  AppTransaction,
  DatabaseService,
  refreshTokens,
} from '../../database';

const hash = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly database: DatabaseService,
    private readonly config: AppConfigService,
  ) {}

  issue(userId: string) {
    return this.insert(this.database.db, userId, randomUUID());
  }

  async rotate(token: string) {
    const tokenHash = hash(token);

    const rotated = await this.database.db.transaction(async (tx) => {
      const [used] = await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(refreshTokens.tokenHash, tokenHash),
            isNull(refreshTokens.revokedAt),
            gt(refreshTokens.expiresAt, new Date()),
          ),
        )
        .returning();
      if (!used) {
        return null;
      }

      const refreshToken = await this.insert(tx, used.userId, used.familyId);
      return { userId: used.userId, refreshToken };
    });

    if (!rotated) {
      await this.revokeFamilyIfReused(tokenHash);
      throw new UnauthorizedException('Invalid refresh token');
    }

    return rotated;
  }

  async revoke(token: string) {
    const [existing] = await this.findByHash(hash(token));
    if (existing) {
      await this.revokeFamily(existing.familyId);
    }
  }

  private async insert(
    executor: AppDatabase | AppTransaction,
    userId: string,
    familyId: string,
  ) {
    const token = randomBytes(32).toString('base64url');
    const ttlMs = this.config.refreshTokenTtlDays * 24 * 60 * 60 * 1000;

    await executor.insert(refreshTokens).values({
      userId,
      familyId,
      tokenHash: hash(token),
      expiresAt: new Date(Date.now() + ttlMs),
    });

    return token;
  }

  private findByHash(tokenHash: string) {
    return this.database.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);
  }

  private async revokeFamilyIfReused(tokenHash: string) {
    const [existing] = await this.findByHash(tokenHash);
    if (existing?.revokedAt) {
      await this.revokeFamily(existing.familyId);
    }
  }

  private revokeFamily(familyId: string) {
    return this.database.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.familyId, familyId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  }
}
