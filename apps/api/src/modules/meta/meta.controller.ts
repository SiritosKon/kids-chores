import { Controller, Get } from '@nestjs/common';
import type { MetaResponse } from '@kids-chores/contracts';
import { MetaService } from './meta.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly meta: MetaService) {}

  @Get()
  read(): MetaResponse {
    return this.meta.read();
  }
}
