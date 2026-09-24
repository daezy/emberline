import { Injectable, Logger } from '@nestjs/common';

import { Mailer } from './mailer';
import type { Email } from './mailer';

@Injectable()
export class LogMailer extends Mailer {
  private readonly logger = new Logger('Mail');

  send(email: Email) {
    this.logger.log(`To ${email.to}: ${email.subject}\n${email.text}`);
    return Promise.resolve();
  }
}
