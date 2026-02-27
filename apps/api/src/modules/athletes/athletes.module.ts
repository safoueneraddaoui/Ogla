import { Module } from '@nestjs/common'
import { AthletesService } from './athletes.service'
import { AthletesResolver } from './athletes.resolver'

@Module({
  providers: [AthletesService, AthletesResolver],
  exports: [AthletesService],
})
export class AthletesModule {}
