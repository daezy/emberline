import { Module } from '@nestjs/common';

import { MailModule } from '../mail';
import { QueueModule } from '../queue';
import { EmailChannel } from './channels/email.channel';
import { NOTIFICATION_CHANNELS } from './channels/notification-channel';
import { NotificationWorker } from './notification-worker';
import { NotificationsService } from './notifications.service';
import { NotificationPreferencesController } from './preferences/notification-preferences.controller';
import { NotificationPreferencesService } from './preferences/notification-preferences.service';

@Module({
  imports: [QueueModule, MailModule],
  controllers: [NotificationPreferencesController],
  providers: [
    EmailChannel,
    // Register new channels here.
    {
      provide: NOTIFICATION_CHANNELS,
      inject: [EmailChannel],
      useFactory: (email: EmailChannel) => [email],
    },
    NotificationPreferencesService,
    NotificationsService,
    NotificationWorker,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
