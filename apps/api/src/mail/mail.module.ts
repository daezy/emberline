import { Module } from '@nestjs/common';

import { AppConfigService } from '../config';
import { LogMailer } from './log-mailer';
import { Mailer } from './mailer';
import { SmtpMailer } from './smtp-mailer';

@Module({
  providers: [
    {
      provide: Mailer,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) =>
        config.smtpUrl
          ? new SmtpMailer(config.smtpUrl, config.mailFrom)
          : new LogMailer(),
    },
  ],
  exports: [Mailer],
})
export class MailModule {}
