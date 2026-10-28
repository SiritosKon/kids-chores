import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccountsService } from './accounts.service';
import { AuthController } from './auth.controller';
import { DevController } from './dev.controller';
import { GoogleService } from './google.service';
import { MeController } from './me.controller';
import { PasskeysService } from './passkeys.service';
import { SessionGuard } from './session.guard';
import { SessionsService } from './sessions.service';

@Module({
  controllers: [AuthController, MeController, DevController],
  providers: [
    AccountsService,
    SessionsService,
    GoogleService,
    PasskeysService,
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class IdentityModule {}
