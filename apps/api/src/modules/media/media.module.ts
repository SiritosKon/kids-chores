import { Module } from '@nestjs/common';
import { MediaSweepService } from './media-sweep.service';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaSweepService],
})
export class MediaModule {}
