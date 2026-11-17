import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from './types';

@Controller('notifications/health')
export class HealthController {
  @Get()
  read(): HealthResponse {
    return { status: 'ok' };
  }
}
