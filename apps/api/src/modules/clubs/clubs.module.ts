import { Module } from '@nestjs/common'
import { ClubsService } from './clubs.service'
import { ClubsResolver } from './clubs.resolver'

@Module({
  providers: [ClubsService, ClubsResolver],
  exports: [ClubsService],
})
export class ClubsModule {}
