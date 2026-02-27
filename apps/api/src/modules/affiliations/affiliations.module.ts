import { Module } from '@nestjs/common'
import { AffiliationsService } from './affiliations.service'
import { AffiliationsResolver } from './affiliations.resolver'

@Module({
  providers: [AffiliationsService, AffiliationsResolver],
  exports: [AffiliationsService],
})
export class AffiliationsModule {}
