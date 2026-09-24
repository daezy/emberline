import { Injectable } from '@nestjs/common';

import { Mailer } from '../../mail';
import type { Notification, Recipient } from '../notification';
import { NotificationChannel } from './notification-channel';
import { renderEmail } from './render-email';

@Injectable()
export class EmailChannel extends NotificationChannel {
  readonly id = 'email';
  readonly label = 'Email';

  constructor(private readonly mailer: Mailer) {
    super();
  }

  send(recipient: Recipient, notification: Notification, deliveryId: string) {
    return this.mailer.send({
      to: recipient.email,
      ...renderEmail(notification),
      idempotencyKey: deliveryId,
    });
  }
}
