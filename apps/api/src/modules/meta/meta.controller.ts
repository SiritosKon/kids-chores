import { Controller, Get } from '@nestjs/common';
import type { MetaResponse } from '@kids-chores/contracts';
import { Public } from '../../platform/http';
import { MetaService } from './meta.service';

@Public()
@Controller('meta')
export class MetaController {
  constructor(private readonly meta: MetaService) {}

  @Get()
  read(): MetaResponse {
    return this.meta.read();
  }
}
