import { Controller, Get } from '@nestjs/common';
import type { MeResponse, Session } from '@kids-chores/contracts';
import { AccountsService } from './accounts.service';
import { CurrentSession } from './lib';

@Controller('me')
export class MeController {
  constructor(private readonly accounts: AccountsService) {}

  @Get()
  read(@CurrentSession() session: Session): Promise<MeResponse> {
    return this.accounts.me(session);
  }
}
