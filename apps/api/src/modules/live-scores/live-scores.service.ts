import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PubSub } from 'graphql-subscriptions'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { UpdateScoreInput } from './dto/update-score.input'
import { LIVE_SCORE_CHANNEL_PREFIX } from './live-scores.gateway'

/** GraphQL subscription event name */
export const MATCH_SCORE_UPDATED = 'matchScoreUpdated'

export interface ScorePayload {
  matchId: string
  score: unknown
  status: string
  winnerId?: string
  updatedAt: Date
}

@Injectable()
export class LiveScoresService {
  private readonly logger = new Logger(LiveScoresService.name)
  /** In-process PubSub for GraphQL subscriptions */
  readonly pubSub = new PubSub()

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Fetch current score and status for a match.
   */
  async getMatchScore(matchId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true, score: true, status: true, winnerId: true, updatedAt: true },
    })
    if (!match) throw new NotFoundException(`Match ${matchId} not found`)
    return match
  }

  /**
   * Update match score in the database, then publish to:
   * 1. Redis channel   → Socket.io gateway broadcasts to subscribed WS clients
   * 2. GraphQL PubSub  → `matchScoreUpdated` subscription fires
   */
  async updateScore(input: UpdateScoreInput): Promise<ScorePayload> {
    const match = await this.prisma.match.findUnique({ where: { id: input.matchId } })
    if (!match) throw new NotFoundException(`Match ${input.matchId} not found`)

    const updated = await this.prisma.match.update({
      where: { id: input.matchId },
      data: {
        ...(input.score !== undefined && { score: input.score as Prisma.InputJsonValue }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.winnerId !== undefined && { winnerId: input.winnerId }),
      },
      select: { id: true, score: true, status: true, winnerId: true, updatedAt: true },
    })

    const payload: ScorePayload = {
      matchId: updated.id,
      score: updated.score,
      status: updated.status,
      winnerId: updated.winnerId ?? undefined,
      updatedAt: updated.updatedAt,
    }

    // Publish to Redis → Socket.io gateway fan-out
    const channel = `${LIVE_SCORE_CHANNEL_PREFIX}${input.matchId}`
    try {
      await this.redisService.publish(channel, payload)
    } catch (err) {
      this.logger.warn(`Redis publish failed for ${channel}`, err)
    }

    // Publish to in-process GraphQL PubSub
    await this.pubSub.publish(MATCH_SCORE_UPDATED, { matchScoreUpdated: payload })

    return payload
  }
}
