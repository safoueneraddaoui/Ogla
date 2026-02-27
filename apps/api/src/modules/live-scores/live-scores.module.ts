import { Module } from '@nestjs/common'
import { LiveScoresService } from './live-scores.service'
import { LiveScoresResolver } from './live-scores.resolver'
import { LiveScoresGateway } from './live-scores.gateway'
import { CompetitionsModule } from '../competitions/competitions.module'

@Module({
  imports: [CompetitionsModule],
  providers: [LiveScoresService, LiveScoresResolver, LiveScoresGateway],
  exports: [LiveScoresService],
})
export class LiveScoresModule {}

