import { Logger } from '@nestjs/common';
import argon2 from 'argon2';
import { Argon2Options } from 'src/services/argon2';

const logger = new Logger('hashPassword');

export const hashPassword = async (password: string) => {
  try {
    const passwordHashed = await argon2.hash(password, Argon2Options);
    return passwordHashed;
  } catch (error) {
    logger.error('Error hashing password', error);
    throw error;
  }
};
