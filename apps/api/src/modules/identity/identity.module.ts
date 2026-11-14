import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from '../../platform/mail';
import { OutboxModule } from '../../platform/outbox';
import { AccountsService } from './accounts.service';
import { AuthController } from './auth.controller';
import { DailyLimitsService } from './daily-limits.service';
import { DevController } from './dev.controller';
import { EmailAuthController } from './email-auth.controller';
import { EmailCodesService } from './email-codes.service';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';
import { MeController } from './me.controller';
import { MembershipsService } from './memberships.service';
import { OidcService } from './oidc.service';
import { PinController } from './pin.controller';
import { PasskeysService } from './passkeys.service';
import { PasswordController } from './password.controller';
import { PasswordsService } from './passwords.service';
import { PinsService } from './pins.service';
import { SessionGuard } from './session.guard';
import { SessionsService } from './sessions.service';

@Module({
  imports: [OutboxModule, MailModule],
  controllers: [AuthController, EmailAuthController, MeController, FamilyController, PinController, PasswordController, DevController],
  providers: [
    AccountsService,
    MembershipsService,
    FamilyService,
    EmailCodesService,
    DailyLimitsService,
    SessionsService,
    OidcService,
    PasskeysService,
    PinsService,
    PasswordsService,
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class IdentityModule {}
