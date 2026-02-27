import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private readonly pub: Redis
  private readonly sub: Redis

  constructor(private readonly config: ConfigService) {
    const redisUrl: string = this.config.get<string>('redis.url') ?? 'redis://localhost:6379'
    this.pub = new Redis(redisUrl, { lazyConnect: true })
    this.sub = new Redis(redisUrl, { lazyConnect: true })

    this.pub.on('error', (err) => this.logger.error('Redis pub error', err))
    this.sub.on('error', (err) => this.logger.error('Redis sub error', err))
  }

  /**
   * Publish a JSON message to a Redis channel.
   */
  async publish(channel: string, payload: unknown): Promise<void> {
    await this.pub.publish(channel, JSON.stringify(payload))
  }

  /**
   * Subscribe to a Redis channel pattern (glob supported).
   * Callback receives: pattern, channel, raw JSON string.
   */
  psubscribe(
    pattern: string,
    onMessage: (pattern: string, channel: string, payload: unknown) => void,
  ): void {
    void this.sub.psubscribe(pattern)
    this.sub.on('pmessage', (pat, channel, message) => {
      if (pat !== pattern) return
      try {
        onMessage(pat, channel, JSON.parse(message) as unknown)
      } catch {
        onMessage(pat, channel, message)
      }
    })
  }

  /**
   * Subscribe to a specific Redis channel.
   */
  subscribe(channel: string, onMessage: (payload: unknown) => void): void {
    void this.sub.subscribe(channel)
    this.sub.on('message', (ch, message) => {
      if (ch !== channel) return
      try {
        onMessage(JSON.parse(message) as unknown)
      } catch {
        onMessage(message)
      }
    })
  }

  onModuleDestroy(): void {
    this.pub.disconnect()
    this.sub.disconnect()
  }
}
