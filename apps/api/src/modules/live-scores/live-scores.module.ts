import { Module } from '@nestjs/common'
import { LiveScoresService } from './live-scores.service'
import { LiveScoresResolver } from './live-scores.resolver'

@Module({
  providers: [LiveScoresService, LiveScoresResolver],
  exports: [LiveScoresService],
})
export class LiveScoresModule {}
