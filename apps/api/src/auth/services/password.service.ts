import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

const options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 2,
  parallelism: 4,
} satisfies argon2.HashOptions;

@Injectable()
export class PasswordService {
  hash(password: string) {
    return argon2.hash(password, options);
  }

  async verify(hash: string, password: string) {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  needsRehash(hash: string) {
    return argon2.needsRehash(hash, options);
  }
}
