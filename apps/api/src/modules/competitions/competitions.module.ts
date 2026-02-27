import { Module } from '@nestjs/common'
import { CompetitionsService } from './competitions.service'
import { CompetitionsResolver } from './competitions.resolver'

@Module({
  providers: [CompetitionsService, CompetitionsResolver],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
