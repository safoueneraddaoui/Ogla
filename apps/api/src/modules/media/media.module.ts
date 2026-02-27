import { Module } from '@nestjs/common'
import { MediaService } from './media.service'
import { MediaResolver } from './media.resolver'

@Module({
  providers: [MediaService, MediaResolver],
  exports: [MediaService],
})
export class MediaModule {}
