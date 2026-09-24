import { Injectable, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService, users } from '../database';
import { UpdateAccountDto } from './dto/update-account.dto';

const accountFields = {
  id: users.id,
  email: users.email,
  name: users.name,
  timezone: users.timezone,
};

@Injectable()
export class AccountService {
  constructor(private readonly database: DatabaseService) {}

  async get(userId: string) {
    const [account] = await this.database.db
      .select(accountFields)
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!account) throw new UnauthorizedException();
    return account;
  }

  async update(userId: string, dto: UpdateAccountDto) {
    if (Object.keys(dto).length === 0) return this.get(userId);

    const [account] = await this.database.db
      .update(users)
      .set(dto)
      .where(eq(users.id, userId))
      .returning(accountFields);
    if (!account) throw new UnauthorizedException();
    return account;
  }
}
