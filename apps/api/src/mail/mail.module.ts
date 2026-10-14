import { Logger, Module } from '@nestjs/common';

import { AppConfigService } from '../config';
import { LogMailer } from './log-mailer';
import { Mailer } from './mailer';
import { SmtpMailer } from './smtp-mailer';

@Module({
  providers: [
    {
      provide: Mailer,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        if (config.smtpUrl) {
          return new SmtpMailer(config.smtpUrl, config.mailFrom);
        }
        if (config.isProduction) {
          new Logger('Mail').warn(
            'SMTP_URL is not set: alert emails will only be written to the log',
          );
        }
        return new LogMailer();
      },
    },
  ],
  exports: [Mailer],
})
export class MailModule {}
