import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from '../../platform/mail';
import { OutboxModule } from '../../platform/outbox';
import { AccountsService } from './accounts.service';
import { AuthController } from './auth.controller';
import { DevController } from './dev.controller';
import { GoogleService } from './google.service';
import { MeController } from './me.controller';
import { PasskeysService } from './passkeys.service';
import { PinCodesService } from './pin-codes.service';
import { PinController } from './pin.controller';
import { SessionGuard } from './session.guard';
import { SessionsService } from './sessions.service';

@Module({
  imports: [OutboxModule, MailModule],
  controllers: [AuthController, MeController, DevController, PinController],
  providers: [
    AccountsService,
    SessionsService,
    GoogleService,
    PasskeysService,
    PinCodesService,
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class IdentityModule {}
