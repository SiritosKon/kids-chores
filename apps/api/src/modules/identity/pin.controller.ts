import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import type { Session } from '@kids-chores/contracts';
import { AuthRateLimit } from '../../platform/rate-limit';
import { PinCodeCheckDto, PinCodeRequestDto } from './dto';
import { CurrentSession } from './lib';
import { PinCodesService } from './pin-codes.service';

@Controller('pin')
export class PinController {
  constructor(private readonly codes: PinCodesService) {}

  @AuthRateLimit()
  @Post('code')
  @HttpCode(204)
  send(@CurrentSession() session: Session, @Body() body: PinCodeRequestDto): Promise<void> {
    return this.codes.send(session, body);
  }

  @AuthRateLimit()
  @Post('code/check')
  @HttpCode(204)
  check(@CurrentSession() session: Session, @Body() body: PinCodeCheckDto): Promise<void> {
    return this.codes.check(session, body);
  }
}
