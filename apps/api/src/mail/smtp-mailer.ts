import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { Mailer } from './mailer';
import type { Email } from './mailer';

@Injectable()
export class SmtpMailer extends Mailer implements OnApplicationShutdown {
  private readonly transport: Transporter;

  constructor(
    smtpUrl: string,
    private readonly from: string,
  ) {
    super();
    this.transport = createTransport(smtpUrl);
  }

  async send({ idempotencyKey, ...email }: Email) {
    await this.transport.sendMail({
      ...email,
      from: this.from,
      // A stable Message-ID lets mail clients collapse a resend after a retry.
      ...(idempotencyKey && { messageId: `<${idempotencyKey}@emberline>` }),
    });
  }

  onApplicationShutdown() {
    this.transport.close();
  }
}
