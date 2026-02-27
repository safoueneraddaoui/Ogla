import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { RedisService } from '../../common/redis/redis.service'
import { LiveScoreUpdateType } from './entities/live-score.entity'

/** Socket.io event names */
export const WS_EVENTS = {
  JOIN_MATCH: 'join_match',
  LEAVE_MATCH: 'leave_match',
  SCORE_UPDATE: 'score_update',
  ERROR: 'error',
} as const

/** Redis channel prefix for live score updates */
export const LIVE_SCORE_CHANNEL_PREFIX = 'match:score:'

@WebSocketGateway({
  namespace: '/live-scores',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class LiveScoresGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server

  private readonly logger = new Logger(LiveScoresGateway.name)

  constructor(private readonly redisService: RedisService) {}

  afterInit(_server: Server): void {
    this.logger.log('LiveScoresGateway initialised')
    // Subscribe to all match score channels in Redis using pattern matching
    this.redisService.psubscribe(
      `${LIVE_SCORE_CHANNEL_PREFIX}*`,
      (_pattern, channel, payload) => {
        // channel is e.g. "match:score:abc123" → extract matchId
        const matchId = channel.replace(LIVE_SCORE_CHANNEL_PREFIX, '')
        const room = `match:${matchId}`
        this.server.to(room).emit(WS_EVENTS.SCORE_UPDATE, payload)
        this.logger.debug(`Broadcast score update to room ${room}`)
      },
    )
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  /**
   * Client subscribes to live score updates for a specific match.
   * Payload: { matchId: string }
   */
  @SubscribeMessage(WS_EVENTS.JOIN_MATCH)
  handleJoinMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    if (!data?.matchId) {
      client.emit(WS_EVENTS.ERROR, { message: 'matchId is required' })
      return
    }
    const room = `match:${data.matchId}`
    void client.join(room)
    this.logger.log(`Client ${client.id} joined room ${room}`)
    client.emit(WS_EVENTS.JOIN_MATCH, { joined: true, matchId: data.matchId })
  }

  /**
   * Client unsubscribes from live score updates for a specific match.
   * Payload: { matchId: string }
   */
  @SubscribeMessage(WS_EVENTS.LEAVE_MATCH)
  handleLeaveMatch(
    @MessageBody() data: { matchId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    if (!data?.matchId) {
      client.emit(WS_EVENTS.ERROR, { message: 'matchId is required' })
      return
    }
    const room = `match:${data.matchId}`
    void client.leave(room)
    this.logger.log(`Client ${client.id} left room ${room}`)
    client.emit(WS_EVENTS.LEAVE_MATCH, { left: true, matchId: data.matchId })
  }

  /**
   * Directly broadcasts a score update to a room (used internally by service for
   * cases where Redis isn't available, e.g. test environments).
   */
  broadcastScoreUpdate(matchId: string, payload: Partial<LiveScoreUpdateType>): void {
    const room = `match:${matchId}`
    this.server.to(room).emit(WS_EVENTS.SCORE_UPDATE, payload)
  }
}
