export type Email = {
  to: string;
  subject: string;
  text: string;
  html: string;
  // Stable across retries of the same email.
  idempotencyKey?: string;
};

export abstract class Mailer {
  abstract send(email: Email): Promise<void>;
}
