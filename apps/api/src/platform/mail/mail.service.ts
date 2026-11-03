import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { APP_CONFIG, type AppConfig } from '../config';
import type { MailMessage } from './types';

@Injectable()
export class MailService implements OnApplicationShutdown {
  private readonly transport: Transporter;

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    this.transport = createTransport(config.SMTP_URL);
  }

  async send(message: MailMessage): Promise<void> {
    await this.transport.sendMail({ from: this.config.MAIL_FROM, ...message });
  }

  onApplicationShutdown(): void {
    this.transport.close();
  }
}
