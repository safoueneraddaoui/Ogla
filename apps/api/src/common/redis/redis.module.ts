import { Global, Module } from '@nestjs/common'
import { RedisService } from './redis.service'

/**
 * Global Redis module — import once in AppModule; all other modules receive
 * RedisService via DI without needing to re-import this module.
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
