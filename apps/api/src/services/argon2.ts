import * as argon2 from 'argon2';
import crypto from 'crypto';

export const Argon2Options: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 2,
  parallelism: 4,
  hashLength: 32,
  salt: crypto.randomBytes(16),
};
